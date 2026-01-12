# backend/app.py

import os

import logging

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware



# 로깅 설정 (에러 추적 용이)

logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)



from backend.routers.health import router as health_router

from backend.routers.recommend import router as recommend_router

from backend.routers.interact import router as interact_router

from backend.routers.products import router as products_router

from backend.routers import events

from backend.services.kafka_producer import get_producer, stop_producer



# safe orders import

try:

    from backend.routers.orders import router as orders_router

    _HAS_ORDERS = True

except Exception as ex:

    orders_router = None

    _HAS_ORDERS = False

    logger.error("❌ Orders router import failed", exc_info=ex)



# 1. 환경 변수 체크 (기본값 false)

ENABLE_KAFKA = os.getenv("ENABLE_KAFKA", "false").lower() == "true"



app = FastAPI(title="Next-Gen E-Commerce API (Hybrid Recommender)")



# 2. CORS 설정 (환경변수 또는 기본값에 의해 관리되도록 개선)



raw_origins = os.getenv(

    "FRONT_ORIGINS",

    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173,http://localhost:4174"

)

# split, strip, filter empty

FRONT_ORIGINS = [o.strip() for o in raw_origins.split(",") if o.strip()]



# NOTE:

# - For local development you can temporarily use allow_origins=["*"], but do NOT use "*" in production if allow_credentials=True.

# - If you need to allow credentials from a specific site, include its exact origin in FRONT_ORIGINS.



app.add_middleware(

    CORSMiddleware,

    allow_origins=FRONT_ORIGINS,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)



# 3. Startup Event 개선

@app.on_event("startup")
async def startup_event():
    if not ENABLE_KAFKA:
        logger.info("🚫 Kafka disabled (ENABLE_KAFKA=false)")
        return

    try:
        await get_producer()
        logger.info("✅ Kafka producer initialized")
    except Exception as e:
        logger.error("❌ Kafka init failed, continuing without Kafka", exc_info=e)


@app.on_event("shutdown")

async def shutdown_event():

    if ENABLE_KAFKA:

        await stop_producer()

        logger.info("🛑 Kafka producer stopped")



# 4. Routers

app.include_router(health_router, prefix="/health", tags=["health"])

app.include_router(products_router, prefix="/api/products", tags=["products"])

app.include_router(recommend_router, prefix="/api/recommend", tags=["recommend"])

# interact_router may already define its own prefix inside; include as-is

app.include_router(interact_router)

app.include_router(events.router, prefix="/events", tags=["events"])



# 4.a Orders router - include only if import succeeded

if _HAS_ORDERS and orders_router is not None:

    app.include_router(

        orders_router,

        prefix="/api/orders",

        tags=["orders"]

    )

    logger.info("✅ Orders router included")

else:

    logger.warning("⚠️ Orders router NOT included")



# optional: lightweight health endpoint root

@app.get("/")

def root():

    return {"ok": True, "service": "next-gen-ecom-backend"}
