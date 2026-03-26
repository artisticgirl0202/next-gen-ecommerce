# backend/app.py
import os
import logging
from pathlib import Path

# ── MUST be called before ANY backend module is imported ──────────────────
# db/session.py reads DATABASE_URL at module-import time via os.getenv().
# If dotenv is not loaded first, it reads an empty string and falls back
# to SQLite — causing "no such table" errors at runtime.
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env", override=False)  # backend/.env

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── DB + ORM models MUST load before any router ───────────────────────────
# Routers import model classes; if they load first, edge cases can leave
# metadata incomplete. Loading Base/engine then all models guarantees
# create_all() sees users, orders, products, etc.
from backend.db import Base, engine
from backend.db import engine  # noqa: F811
from sqlalchemy import text

import backend.models  # noqa: F401 — registers Order, Product, User via __init__.py
from backend.models.user import User  # noqa: F401 — explicit: ensures `users` table

# 라우터 및 기타 임포트 (모델 등록 이후)
from backend.routers.health import router as health_router
from backend.routers.recommend import router as recommend_router
from backend.routers.interact import router as interact_router
from backend.routers.products import router as products_router
from backend.routers import events
from backend.routers.auth import router as auth_router
from backend.services.kafka_producer import get_producer, stop_producer

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
# CRITICAL: allow_credentials=True requires explicit origins (no wildcard "*").
# The Vercel production URL must be listed here so HttpOnly cookies are accepted.
_DEFAULT_ORIGINS = ",".join([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",  # <-- 요기 추가!
    "http://127.0.0.1:5174",  # <-- (선택) 안전하게 127.0.0.1도 추가해주면 좋습니다!
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:4174",
    "https://next-gen-ecommerce-six.vercel.app",
])
raw_origins = os.getenv("FRONT_ORIGINS", _DEFAULT_ORIGINS)
FRONT_ORIGINS = [o.strip() for o in raw_origins.split(",") if o.strip()]

logger.info(f"🌐 CORS allowed origins: {FRONT_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONT_ORIGINS,
    allow_credentials=True,   # Required for HttpOnly cookie (Refresh Token) exchange
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

@app.on_event("startup")
async def on_startup():
    # 0) 연결 대상 DB 호스트 확인 로그 (로컬 vs 클라우드 즉시 확인)
    _db_url = os.getenv("DATABASE_URL", "")
    try:
        from urllib.parse import urlparse
        _parsed = urlparse(_db_url)
        logger.info(f"🗄️  Database host → {_parsed.hostname}:{_parsed.port or 5432}  db={_parsed.path.lstrip('/')}")
    except Exception:
        logger.info(f"🗄️  DATABASE_URL={_db_url[:60]}...")

    # 1) DB 테이블 생성 (없으면 생성)
    try:
        registered = sorted(Base.metadata.tables.keys())
        logger.info(f"📋 Registered tables in metadata: {registered}")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ DB Schema ensured (Tables created if not exist)")
    except Exception as e:
        logger.error(f"❌ DB Table creation failed: {e}")

    # 2) Kafka 초기화 (연결 실패 시 서버 부팅을 막지 않음)
    if ENABLE_KAFKA:
        try:
            await get_producer()
            logger.info("✅ Kafka producer initialized")
        except Exception as e:
            # aiokafka now surfaces after 10-second timeout instead of looping
            # forever — log the failure and continue booting normally.
            logger.warning(
                "⚠️ Kafka unavailable (%s) — server will run without Kafka. "
                "Set ENABLE_KAFKA=false in backend/.env to suppress this warning.",
                e,
            )
    else:
        logger.info("🚫 Kafka disabled (ENABLE_KAFKA=false)")

@app.on_event("shutdown")
async def shutdown_event():
    if ENABLE_KAFKA:
        await stop_producer()
        logger.info("🛑 Kafka producer stopped")

@app.get("/api/seed")
def seed_database():
    try:
        with engine.connect() as conn:
            # 1. 기존 데이터 싹 지우기 (초기화)
            conn.execute(text("TRUNCATE TABLE products RESTART IDENTITY CASCADE;"))

            # 2. 데이터 새로 넣기
            insert_query = text("""
                INSERT INTO products (name, price, category, image, description, specs, reviews) VALUES 
                ('Quantum Blade Laptop', 1299.00, 'Computing Devices', '/images/products/laptop-1.jpg', 'Next-generation processing power.', '{"cpu": "i9", "ram": "32GB"}', 4.8),
                ('Neural Link Watch', 399.00, 'Mobile & Wearables', '/images/products/watch-1.jpg', 'Advanced biometric tracking.', '{"battery": "48h", "waterproof": "5ATM"}', 4.5),
                ('Sonic Echo Pods', 199.00, 'Audio Devices', '/images/products/earbuds-1.jpg', 'Lossless spatial audio.', '{"noise_cancel": "active", "playtime": "24h"}', 4.6),
                ('OLED Curve 8K', 2499.00, 'Video & Display', '/images/products/tv-1.jpg', 'Ultra-thin 8K OLED display.', '{"size": "65inch", "refresh": "120Hz"}', 4.9),
                ('Alpha Lens Z9', 1899.00, 'Cameras & Imaging', '/images/products/camera-1.jpg', 'Full-frame mirrorless camera.', '{"sensor": "50MP", "video": "8K"}', 4.7)
            """)
            conn.execute(insert_query)
            conn.commit()

        return {"message": "✅ 데이터 초기화 성공! 이제 메인 화면을 새로고침 해보세요."}

    except Exception as e:
        return {"error": f"🚨 초기화 실패: {str(e)}"}

# 라우터 등록
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
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
