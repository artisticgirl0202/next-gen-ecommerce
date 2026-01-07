import os
import asyncio
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from aiokafka import AIOKafkaProducer
from aiokafka.errors import KafkaConnectionError
from backend.services.user_history import push_user_history

router = APIRouter()
logger = logging.getLogger("events")

# 환경 변수 체크
BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
ENABLE_KAFKA = os.getenv("ENABLE_KAFKA", "false").lower() == "true"
TOPIC = "user-events"

# 글로벌 프로듀서 객체
producer = None

class UserEvent(BaseModel):
    user_id: str
    item_id: int
    event_type: str  # view, click, buy 등

@router.on_event("startup")
async def startup_event():
    global producer

    # --- 수정된 부분: ENABLE_KAFKA가 false면 연결 시도를 하지 않음 ---
    if not ENABLE_KAFKA:
        logger.info("Kafka is disabled in events router. Skipping producer startup.")
        return

    # Producer가 준비될 때까지 재시도하는 로직
    while True:
        try:
            producer = AIOKafkaProducer(
                bootstrap_servers=BOOTSTRAP_SERVERS,
                retry_backoff_ms=500
            )
            await producer.start()
            logger.info("✅ Backend Producer connected to Kafka successfully!")
            break
        except (KafkaConnectionError, Exception) as e:
            logger.warning(f"⚠️ Kafka Producer failed to start: {e}. Retrying in 5s...")
            await asyncio.sleep(5)

@router.on_event("shutdown")
async def shutdown_event():
    if producer:
        await producer.stop()

@router.post("/")
async def send_event(event: UserEvent):
    # 1️⃣ Redis 즉시 반영 (Kafka와 무관하게 실행)
    try:
        push_user_history(
            user_id=event.user_id,
            item_id=event.item_id,
            event_type=event.event_type
        )
    except Exception as e:
        logger.error(f"Redis push failed: {e}")

    # 2️⃣ Kafka 로그 (활성화 상태일 때만)
    if ENABLE_KAFKA and producer:
        try:
            await producer.send_and_wait(TOPIC, event.json().encode())
            return {"status": "ok", "message": "Event processed (Redis + Kafka)"}
        except Exception as e:
            logger.error(f"Kafka send failed: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return {"status": "ok", "message": "Event processed (Redis only)"}
