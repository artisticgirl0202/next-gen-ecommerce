# backend/app.py
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 라우터 임포트
from backend.routers.health import router as health_router
from backend.routers.recommend import router as recommend_router
from backend.routers.interact import router as interact_router
from backend.routers.products import router as products_router
from backend.routers import events
from backend.services.kafka_producer import get_producer, stop_producer

# DB 임포트
from backend.db import Base, engine

# 주문(Orders) 라우터 안전하게 임포트
try:
    from backend.routers.orders import router as orders_router
    _HAS_ORDERS = True
except ImportError:
    _HAS_ORDERS = False
    orders_router = None

# 환경 변수 체크
ENABLE_KAFKA = os.getenv("ENABLE_KAFKA", "false").lower() == "true"

app = FastAPI(title="Next-Gen E-Commerce API (Hybrid Recommender)")

# CORS 설정
raw_origins = os.getenv(
    "FRONT_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173,http://localhost:4174"
)
FRONT_ORIGINS = [o.strip() for o in raw_origins.split(",") if o.strip()]

# CORS 설정 로깅
logger.info(f"🌐 CORS allowed origins: {FRONT_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONT_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

@app.on_event("startup")
async def on_startup():
    # 1) DB 테이블 생성 (없으면 생성)
    # 실제 데이터 초기화는 python backend/seed.py 로 수행합니다.
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ DB Schema ensured (Tables created if not exist)")
    except Exception as e:
        logger.error(f"❌ DB Table creation failed: {e}")

    # 2) Kafka 초기화
    if ENABLE_KAFKA:
        try:
            await get_producer()
            logger.info("✅ Kafka producer initialized")
        except Exception as e:
            logger.error("❌ Kafka init failed, continuing without Kafka", exc_info=e)
    else:
        logger.info("🚫 Kafka disabled (ENABLE_KAFKA=false)")

@app.on_event("shutdown")
async def shutdown_event():
    if ENABLE_KAFKA:
        await stop_producer()
        logger.info("🛑 Kafka producer stopped")

# 라우터 등록
app.include_router(health_router, prefix="/health", tags=["health"])
app.include_router(products_router, prefix="/api/products", tags=["products"])
app.include_router(recommend_router, prefix="/api/recommend", tags=["recommend"])
app.include_router(interact_router)
app.include_router(events.router, prefix="/events", tags=["events"])

if _HAS_ORDERS and orders_router:
    app.include_router(orders_router, prefix="/api/orders", tags=["orders"])
    logger.info("✅ Orders router included")

@app.get("/")
def root():
    return {"ok": True, "service": "next-gen-ecom-backend"}
