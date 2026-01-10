

import os

import json

import asyncio

from typing import Optional

from backend.schemas.events.order_events import OrderCreatedEvent





try:

    from aiokafka import AIOKafkaProducer

    _HAS_AIOKAFKA = True

except Exception:

    _HAS_AIOKAFKA = False



BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")

DEFAULT_TOPIC = os.getenv("KAFKA_TOPIC", "user-events")



_producer: Optional["AIOKafkaProducer"] = None

_producer_lock = asyncio.Lock()





async def get_producer() -> "AIOKafkaProducer":

    """

    Lazily start and return a singleton producer.

    Raises RuntimeError if aiokafka not available.

    """

    global _producer

    if not _HAS_AIOKAFKA:

        raise RuntimeError("aiokafka not available")



    async with _producer_lock:

        if _producer is None:

            _producer = AIOKafkaProducer(

                bootstrap_servers=BOOTSTRAP,

                value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode("utf-8"),

            )

            await _producer.start()

            print(f"[kafka_producer] started -> {BOOTSTRAP}")

    return _producer





async def produce(topic: Optional[str], value: dict, timeout: float = 5.0) -> None:

    """

    Async produce. Callers inside async code should await this.

    """

    if not _HAS_AIOKAFKA:

        raise RuntimeError("aiokafka not available")



    p = await get_producer()

    topic = topic or DEFAULT_TOPIC

    await p.send_and_wait(topic, value)





async def stop_producer() -> None:

    """

    Graceful stop of the singleton producer.

    """

    global _producer

    if _producer:

        try:

            await _producer.stop()

            print("[kafka_producer] stopped")

        finally:

            _producer = None



async def send_event(topic: str, event: dict):

    p = await get_producer()

    await p.send_and_wait(topic, event)



# ---- sync wrapper for FastAPI routes that call producer synchronously ----

def _ensure_event_loop():

    try:

        loop = asyncio.get_event_loop()

    except RuntimeError:

        loop = asyncio.new_event_loop()

        asyncio.set_event_loop(loop)

    return loop







def send_user_event(event: dict, topic: Optional[str] = None) -> None:

    """

    Non-blocking wrapper to enqueue an async produce task.

    Used by sync FastAPI handlers (they import send_user_event).

    The task runs on the running loop; if no running loop, create one in background.

    """

    if not _HAS_AIOKAFKA:

        # fallback: log to stdout so system still works

        print("[kafka_producer][fallback] event:", event)

        return



    loop = None

    try:

        loop = asyncio.get_event_loop()

        # if loop is running, schedule the coroutine

        if loop.is_running():

            asyncio.run_coroutine_threadsafe(produce(topic, event), loop)

            return

    except RuntimeError:

        # no running loop in current thread/process

        pass



    # Create a background loop to run the send (only if necessary).

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



    # fire-and-forget thread

    import threading

    t = threading.Thread(target=_run_in_new_loop, daemon=True)

    t.start()



async def send_order_created(order) -> None:

    """

    Publish OrderCreatedEvent to Kafka.

    This function is SAFE to be scheduled via asyncio.create_task().

    """

    event = OrderCreatedEvent(

        type="order.created",

        orderId=order.id,

        orderNo=order.order_no,

        userId=order.user_id,

        totalAmount=float(order.total_amount),

        items=order.items,

        timestamp=datetime.utcnow(),

    )



    await send_event(

        topic=ORDER_EVENTS_TOPIC,

        payload=event.model_dump(mode="json"),

    )
