# backend/app.py
import os
import json  # <--- [추가] JSON 파일을 읽기 위해 필요
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

# [수정] SessionLocal을 추가로 가져와야 데이터를 넣을 수 있습니다.
from backend.db import Base, engine, SessionLocal

# [추가] Product 모델을 가져와야 데이터를 DB 객체로 변환할 수 있습니다.
# (파일 위치가 backend/models/product.py 라면 아래처럼, 혹은 backend.models에서 가져옵니다)
try:
    from backend.models import Product
except ImportError:
    # 혹시 models/__init__.py에 정의 안되어 있다면 구체적인 경로 시도
    from backend.models.product import Product

import backend.models.order

# safe orders import
from backend.routers.orders import router as orders_router
_HAS_ORDERS = True

# 1. 환경 변수 체크
ENABLE_KAFKA = os.getenv("ENABLE_KAFKA", "false").lower() == "true"

app = FastAPI(title="Next-Gen E-Commerce API (Hybrid Recommender)")

# 2. CORS 설정
raw_origins = os.getenv(
    "FRONT_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173,http://localhost:4174"
)
FRONT_ORIGINS = [o.strip() for o in raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONT_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- [추가] 데이터 시딩(Seeding) 함수 ---
def seed_products_if_empty():
    db = SessionLocal()
    try:
        # DB에 상품이 하나라도 있는지 확인
        if db.query(Product).first() is None:
            logger.info("🚀 DB가 비어있습니다. 초기 데이터를 적재합니다...")

            # [중요] 경로 설정: app.py가 있는 폴더 기준 data/products.json을 찾습니다.
            # E:\... 절대 경로 대신 이 방식을 써야 Render에서도 작동합니다.
            current_dir = os.path.dirname(__file__)
            json_path = os.path.join(current_dir, "data", "products.json")

            if os.path.exists(json_path):
                with open(json_path, "r", encoding="utf-8") as f:
                    products_data = json.load(f)

                # 대량 삽입 (Bulk Insert가 빠르지만, 안전하게 객체 매핑 사용)
                for item in products_data:
                    # JSON 키와 DB 컬럼명이 일치해야 합니다.
                    # 필요한 경우 item.get("key", default) 처리를 하세요.
                    product = Product(
                        id=item.get("id"),
                        name=item.get("name"),
                        category=item.get("category"),
                        price=item.get("price"),
                        img_url=item.get("img_url"),
                        description=item.get("description", "")
                    )
                    db.add(product)

                db.commit()
                logger.info(f"✅ {len(products_data)}개의 상품 데이터 적재 완료!")
            else:
                logger.warning(f"⚠️ 데이터 파일을 찾을 수 없습니다: {json_path}")
        else:
            logger.info("✅ DB에 이미 데이터가 존재합니다.")
    except Exception as e:
        logger.error(f"❌ 데이터 적재 중 오류 발생: {e}")
        db.rollback()
    finally:
        db.close()

# 3. Startup Event 개선
@app.on_event("startup")
async def on_startup():
    # 1) DB 스키마(테이블) 보장
    Base.metadata.create_all(bind=engine)
    logger.info("✅ DB tables ensured")

    # [추가] 테이블 생성 직후 데이터 적재 실행
    seed_products_if_empty()

    # 2) Kafka 초기화
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
app.include_router(interact_router)
app.include_router(events.router, prefix="/events", tags=["events"])

# 4.a Orders router
if _HAS_ORDERS and orders_router is not None:
    app.include_router(
        orders_router,
        prefix="/api/orders",
        tags=["orders"]
    )
    logger.info("✅ Orders router included")
else:
    logger.warning("⚠️ Orders router NOT included")

@app.get("/")
def root():
    return {"ok": True, "service": "next-gen-ecom-backend"}
