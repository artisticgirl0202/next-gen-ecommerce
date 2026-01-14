from fastapi import APIRouter, Query, Depends
from typing import Any, List
import redis, os, json
from sqlalchemy.orm import Session
from sqlalchemy import text  # SQL 직접 실행을 위해 필요

# DB 연결 도구 가져오기 (경로가 맞는지 확인하세요)
from backend.db import get_db

router = APIRouter()

# Redis 연결
r = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True
)

@router.get("/", summary="List products (Redis with DB Fallback)")
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=200),
    db: Session = Depends(get_db)  # DB 연결 의존성 주입
) -> dict[str, Any]:

    # 1. Redis에서 데이터 조회 시도
    raw_items = r.lrange("items:list", 0, -1)

    items = []
    if len(raw_items) > 0:
        # Redis에 데이터가 있으면 그거 사용
        print("cache hit! using redis")
        items = [json.loads(it) for it in raw_items]
    else:
        # 2. Redis가 비었으면 DB(PostgreSQL)에서 조회 (Fallback)
        print("cache miss! fetching from db...")

        # seed.py가 만든 'products' 테이블을 직접 조회
        # (ORM 모델을 아직 안 만들었을 수도 있으니 raw SQL 사용)
        try:

            result = db.execute(text("SELECT id, name, price, category, image, description FROM products"))
            rows = result.fetchall()

            for row in rows:
                product_dict = {
                    "id": row.id,
                    "name": row.name,
                    "price": row.price,
                    "category": row.category,

                    "image": row.image,
                    "description": row.description
                }
                items.append(product_dict)

            # 3. 가져온 데이터를 Redis에 저장 (다음 번엔 빠르게!)
            if items:
                # Redis에 넣을 때는 문자열(JSON)로 변환
                json_strings = [json.dumps(item) for item in items]
                r.rpush("items:list", *json_strings)
                # (선택) 1시간 뒤 만료되게 설정
                r.expire("items:list", 3600)

        except Exception as e:
            print(f"DB Error: {e}")
            items = []

    # 3. 페이징 처리
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    page_items = items[start:end]

    return {
        "items": page_items,
        "total": total,
        "page": page,
        "pageSize": page_size
    }
