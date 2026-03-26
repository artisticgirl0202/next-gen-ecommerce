# backend/services/kafka_producer.py
import os
import json
import asyncio
import threading
from typing import Optional

try:
    from aiokafka import AIOKafkaProducer
    _HAS_AIOKAFKA = True
except Exception:
    _HAS_AIOKAFKA = False


BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
DEFAULT_TOPIC = os.getenv("KAFKA_TOPIC", "order.events")

_producer: Optional["AIOKafkaProducer"] = None
_producer_lock = asyncio.Lock()


# ---------------------------------------------------------------------
# Core async producer
# ---------------------------------------------------------------------
async def get_producer() -> "AIOKafkaProducer":
    """
    Lazily create and start a singleton Kafka producer.

    aiokafka retries internally on connection failure — without a timeout
    this coroutine blocks forever and prevents the FastAPI startup from
    completing. asyncio.wait_for() enforces a hard deadline so the caller
    can handle the failure and move on.
    """
    if not _HAS_AIOKAFKA:
        raise RuntimeError("aiokafka not available")

    global _producer
    async with _producer_lock:
        if _producer is None:
            candidate = AIOKafkaProducer(
                bootstrap_servers=BOOTSTRAP,
                value_serializer=lambda v: json.dumps(
                    v, ensure_ascii=False
                ).encode("utf-8"),
            )
            try:
                # Hard 10-second deadline — prevents infinite retry hang
                await asyncio.wait_for(candidate.start(), timeout=10.0)
            except (asyncio.TimeoutError, Exception) as exc:
                # Clean up the unclosed producer object before re-raising
                try:
                    await candidate.stop()
                except Exception:
                    pass
                raise RuntimeError(f"Kafka connection failed: {exc}") from exc

            _producer = candidate
            print(f"[kafka_producer] started -> {BOOTSTRAP}")
    return _producer


async def produce(topic: Optional[str], value: dict) -> None:
    """
    Async produce. Must be awaited inside async code.
    """
    if not _HAS_AIOKAFKA:
        raise RuntimeError("aiokafka not available")

    p = await get_producer()
    await p.send_and_wait(topic or DEFAULT_TOPIC, value)


async def stop_producer() -> None:
    """
    Gracefully stop the singleton producer.
    """
    global _producer
    if _producer:
        try:
            await _producer.stop()
            print("[kafka_producer] stopped")
        finally:
            _producer = None


# ---------------------------------------------------------------------
# Sync wrapper for FastAPI / service layer
# ---------------------------------------------------------------------
def send_user_event(event: dict, topic: Optional[str] = None) -> None:
    """
    Fire-and-forget Kafka publish for synchronous code.

    - If an event loop is running: schedules coroutine safely
    - If not: spins up a background thread + loop
    - Never blocks the request thread
    """
    if not _HAS_AIOKAFKA:
        print("[kafka_producer][fallback] event:", event)
        return

    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.run_coroutine_threadsafe(
                produce(topic, event),
                loop,
            )
            return
    except RuntimeError:
        # no event loop in this thread
        pass

    def _run_in_new_loop():
        new_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(new_loop)
        try:
            new_loop.run_until_complete(get_producer())
            new_loop.run_until_complete(produce(topic, event))
        finally:
            try:
                new_loop.run_until_complete(stop_producer())
            except Exception:
                pass
            new_loop.close()

    threading.Thread(target=_run_in_new_loop, daemon=True).start()
