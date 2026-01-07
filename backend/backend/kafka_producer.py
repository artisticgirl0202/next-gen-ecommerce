# backend/kafka_producer.py
import os
import json
import asyncio
from aiokafka import AIOKafkaProducer

BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
producer: AIOKafkaProducer | None = None
_producer_lock = asyncio.Lock()

async def get_producer():
    global producer
    async with _producer_lock:
        if producer is None:
            p = AIOKafkaProducer(bootstrap_servers=BOOTSTRAP)
            await p.start()
            producer = p
    return producer

async def produce(topic: str, value: dict):
    """
    Produce a JSON message (utf-8 bytes) to Kafka.
    Non-fatal on failure (caller handles fallback).
    """
    try:
        p = await get_producer()
        await p.send_and_wait(topic, json.dumps(value, ensure_ascii=False).encode("utf-8"))
    except Exception as e:
        # log and re-raise so callers can choose fallback behavior
        print(f"[kafka_producer] produce failed topic={topic}: {e}")
        raise
