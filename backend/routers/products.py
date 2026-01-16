from fastapi import APIRouter, Query, Depends
from typing import Any, List
import redis, os, json
from sqlalchemy.orm import Session
from sqlalchemy import text

# DB 연결 도구 가져오기
from backend.db import get_db

router = APIRouter()

# Redis 연결 설정
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

try:
    r = redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        decode_responses=True,
        socket_timeout=5
    )
except Exception as e:
    print(f"⚠️ Redis 연결 실패 (로그 확인용): {e}")
    r = None

@router.get("/", summary="List products (Redis with DB Fallback)")
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=200),
    db: Session = Depends(get_db)
) -> dict[str, Any]:

    items = []
    source = "none"

    # 1. Redis에서 데이터 조회 시도
    try:
        raw_items = r.lrange("items:list", 0, -1) if r else []
        if raw_items and len(raw_items) > 0:
            print("🚀 [Cache Hit] Using data from Redis")
            items = [json.loads(it) for it in raw_items]
            source = "redis"
    except Exception as e:
        print(f"⚠️ Redis 조회 중 오류: {e}")
        raw_items = []

    # 2. Redis가 비어있거나 오류가 나면 DB에서 조회 (Fallback)
    if not items:
        print("🔍 [Cache Miss] Fetching directly from PostgreSQL...")
        try:
            # SQL 직접 실행 (테이블명 'products' 확인 필수)
            query = text("SELECT id, name, price, category, image, description FROM products")
            result = db.execute(query)
            rows = result.fetchall()

            for row in rows:
                # SQLAlchemy row 객체 접근 안전하게 처리
                product_dict = {
                    "id": row[0],
                    "name": row[1],
                    "price": float(row[2]) if row[2] else 0,
                    "category": row[3],
                    "image": row[4],
                    "description": row[5]
                }
                items.append(product_dict)

            print(f"✅ DB에서 {len(items)}개의 데이터를 찾았습니다.")

            # 3. 가져온 데이터를 Redis에 캐싱 (성공했을 때만)
            if items and r:
                try:
                    r.delete("items:list") # 기존 잘못된 캐시가 있을 수 있으므로 초기화
                    json_strings = [json.dumps(item) for item in items]
                    r.rpush("items:list", *json_strings)
                    r.expire("items:list", 3600) # 1시간 유지
                    print("💾 DB 데이터를 Redis에 캐싱 완료")
                except Exception as cache_e:
                    print(f"⚠️ Redis 저장 실패: {cache_e}")

            source = "database"

        except Exception as e:
            print(f"🚨 [DB Error] 데이터 조회 실패: {e}")
            items = []

    # 4. 페이징 처리
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    page_items = items[start:end]

    return {
        "items": page_items,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "debug_source": source  # 데이터가 어디서 왔는지 확인용
    }
