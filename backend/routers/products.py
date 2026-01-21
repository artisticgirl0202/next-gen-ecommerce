from fastapi import APIRouter, Query, Depends, HTTPException
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
    page_size: int = Query(600, ge=1, le=1000),
    db: Session = Depends(get_db)
) -> dict[str, Any]:

    items = []
    source = "none"

    # 1. Redis에서 데이터 조회 시도
    try:
        # 캐시 키 이름 (구분을 위해 products:list로 변경 권장하거나 기존 유지)
        raw_items = r.lrange("items:list", 0, -1) if r else []
        if raw_items and len(raw_items) > 0:
            print("🚀 [Cache Hit] Using data from Redis")
            items = [json.loads(it) for it in raw_items]
            # brand가 비어있는 캐시라면 DB로 재조회하여 갱신
            if items and all(not (it or {}).get("brand") for it in items):
                print("ℹ️ [Cache Incomplete] brand missing -> fallback to DB")
                items = []
            else:
                source = "redis"
    except Exception as e:
        print(f"⚠️ Redis 조회 중 오류: {e}")
        raw_items = []

    # 2. Redis가 비어있거나 오류가 나면 DB에서 조회 (Fallback)
    if not items:
        print("🔍 [Cache Miss] Fetching directly from PostgreSQL...")
        try:
            # [수정됨] brand/specs/reviews 컬럼도 같이 조회합니다.
            query = text("SELECT id, name, brand, price, category, image, description, specs, reviews FROM products")
            result = db.execute(query)
            rows = result.fetchall()

            for row in rows:
                product_dict = {
                    "id": row[0],
                    "name": row[1],
                    "brand": row[2],
                    "price": float(row[3]) if row[3] else 0,
                    "category": row[4],
                    "image": row[5],       # DB 컬럼명 image와 일치 (굿!)
                    "description": row[6],
                    "specs": row[7],       # [추가됨] JSONB 데이터는 파이썬 딕셔너리로 자동 변환됨
                    "reviews": row[8]      # [추가됨]
                }
                items.append(product_dict)

            print(f"✅ DB에서 {len(items)}개의 데이터를 찾았습니다.")

            # 3. 가져온 데이터를 Redis에 캐싱 (성공했을 때만)
            if items and r:
                try:
                    # 기존 캐시가 있다면 포맷이 다를 수 있으니 삭제 후 재생성
                    r.delete("items:list")
                    json_strings = [json.dumps(item) for item in items]
                    r.rpush("items:list", *json_strings)
                    r.expire("items:list", 3600) # 1시간 유지
                    print("💾 DB 데이터를 Redis에 캐싱 완료")
                except Exception as cache_e:
                    print(f"⚠️ Redis 저장 실패: {cache_e}")

            source = "database"

        except Exception as e:
            error_msg = f"Database Error: {str(e)}"
            print(f"🚨 {error_msg}")
            # items = []
            raise HTTPException(status_code=500, detail=f"Database Connection Error: {str(e)}")

    # 4. 페이징 처리
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    page_items = items[start:end]

    # 디버깅 로그 추가
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"📦 Products API: source={source}, total={total}, page={page}, page_size={page_size}, returning={len(page_items)} items")
    if total == 0:
        logger.warning("⚠️ No products found! Check Redis and database connection.")

    return {
        "items": page_items,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "debug_source": source  # 데이터가 어디서 왔는지 확인용
    }
