import os
import json
import logging
from typing import Any

from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.db import get_db

# ── logging ───────────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)

router = APIRouter()

# ── Redis 연결 (REDIS_URL 환경변수 사용) ──────────────────────────────────────
_redis_client = None
try:
    import redis as _redis_mod
    _redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
    _redis_client = _redis_mod.from_url(
        _redis_url,
        decode_responses=True,
        socket_timeout=5,
        socket_connect_timeout=3,
    )
    _redis_client.ping()
    logger.info("✅ Redis connected")
except Exception as _e:
    logger.warning(f"⚠️ Redis 연결 실패: {_e} — DB 직접 조회로 동작합니다.")
    _redis_client = None

# ── 캐시 설정 ──────────────────────────────────────────────────────────────
_CACHE_KEY = "products:list"
_CACHE_TTL = 3600  # 1시간

# ── 필요한 컬럼만 명시 (SELECT * 제거 → 전송량 최소화) ─────────────────────
_SELECT_COLS = "id, name, brand, price, category, image, description, specs, reviews"


@router.get("/", summary="List products (Redis → PostgreSQL fallback)")
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(600, ge=1, le=1000),
    db: Session = Depends(get_db),
) -> dict[str, Any]:

    items: list = []
    source = "none"

    # ── 1. Redis 캐시 조회 ─────────────────────────────────────────────────
    if _redis_client:
        try:
            raw_items = _redis_client.lrange(_CACHE_KEY, 0, -1)
            if raw_items:
                parsed = [json.loads(it) for it in raw_items]
                # brand 누락 캐시는 무효 처리
                if parsed and any((it or {}).get("brand") for it in parsed):
                    items = parsed
                    source = "redis"
                    logger.info(f"🚀 [Cache Hit] Redis {len(items)}개")
                else:
                    logger.info("ℹ️ [Cache Incomplete] brand 없음 → DB 재조회")
        except Exception as cache_err:
            logger.warning(f"⚠️ Redis 조회 오류: {cache_err}")

    # ── 2. DB 조회 (Cache Miss) ────────────────────────────────────────────
    if not items:
        logger.info("🔍 [Cache Miss] PostgreSQL 직접 조회 중...")
        try:
            result = db.execute(
                text(f"SELECT {_SELECT_COLS} FROM products ORDER BY id")
            )
            rows = result.fetchall()

            items = [
                {
                    "id":          row[0],
                    "name":        row[1],
                    "brand":       row[2],
                    "price":       float(row[3]) if row[3] is not None else 0.0,
                    "category":    row[4],
                    "image":       row[5],
                    "description": row[6],
                    "specs":       row[7],
                    "reviews":     row[8],
                }
                for row in rows
            ]
            source = "database"
            logger.info(f"✅ DB에서 {len(items)}개 조회 완료")

            # ── 3. Redis에 캐싱 (성공 시) ───────────────────────────────────
            if items and _redis_client:
                try:
                    pipe = _redis_client.pipeline()
                    pipe.delete(_CACHE_KEY)
                    pipe.rpush(_CACHE_KEY, *[json.dumps(it) for it in items])
                    pipe.expire(_CACHE_KEY, _CACHE_TTL)
                    pipe.execute()
                    logger.info(f"💾 Redis 캐싱 완료 ({_CACHE_TTL}s)")
                except Exception as set_err:
                    logger.warning(f"⚠️ Redis 저장 실패: {set_err}")

        except Exception as db_err:
            logger.error(f"🚨 DB 오류: {db_err}")
            raise HTTPException(
                status_code=500,
                detail=f"Database error: {db_err}",
            )

    if not items:
        logger.warning("⚠️ 상품 없음. Redis·DB 연결을 확인하세요.")

    # ── 4. 페이징 ─────────────────────────────────────────────────────────
    total = len(items)
    start = (page - 1) * page_size
    page_items = items[start: start + page_size]

    logger.info(
        f"📦 Products API | source={source} total={total} "
        f"page={page} page_size={page_size} returning={len(page_items)}"
    )

    return {
        "items":       page_items,
        "total":       total,
        "page":        page,
        "pageSize":    page_size,
        "debug_source": source,
    }
