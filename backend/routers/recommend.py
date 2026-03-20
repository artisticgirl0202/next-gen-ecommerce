from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Any
import numpy as np
import traceback, logging
from backend.redis_client import redis_client
import json
from sqlalchemy.orm import Session
from sqlalchemy import text  # SQL 실행을 위해 필요

# 기존 모듈 임포트 유지
# (만약 모듈 경로 에러가 나면 해당 부분은 주석 처리하거나 경로를 맞춰주세요)
from backend.schemas.recommend import RecommendResponse
from backend.embedding import load_products, load_embeddings
from backend.recommender import FaissIndex, DINReRanker
from backend.services.cache import get_cached_topk, set_cached_topk, boost_by_recent_clicks
from backend.db import get_db # DB 세션 의존성 추가

logger = logging.getLogger("recommend")
router = APIRouter()

# ---------------------------------------------------------
# 1. 초기화 (기존 로직 유지)
# ---------------------------------------------------------
PRODUCTS = load_products() or []
prod_id_to_idx = {}
idx_to_prod = {}

# 안전하게 ID 매핑
for i, p in enumerate(PRODUCTS):
    try:
        pid = int(p.get("id"))
    except Exception:
        pid = p.get("id")
    prod_id_to_idx[pid] = i
    idx_to_prod[i] = p

EMBEDDINGS = load_embeddings()
FAISS = None
DIN = None

# 임베딩 로드 시도
if EMBEDDINGS is not None and getattr(EMBEDDINGS, "size", 0) > 0:
    try:
        FAISS = FaissIndex(EMBEDDINGS)
    except Exception:
        logger.exception("FaissIndex initialization failed")
        FAISS = None
    try:
        emb_dim = EMBEDDINGS.shape[1] if getattr(EMBEDDINGS, "ndim", 0) and EMBEDDINGS.shape[1] else 128
        DIN = DINReRanker(emb_dim=emb_dim)
    except Exception:
        logger.exception("DINReRanker initialization failed")
        DIN = None

# ---------------------------------------------------------
# 2. 헬퍼 함수: DB에서 랜덤 상품 가져오기 (비상용)
# ---------------------------------------------------------
def get_fallback_from_db(db: Session, limit: int = 6):
    """
    FAISS나 Redis에 데이터가 없을 때, DB에서 직접 랜덤하게 가져옵니다.
    """
    try:
        # PostgreSQL RANDOM() 사용
        query = text("""
            SELECT id, name, price, image, category, description 
            FROM products 
            ORDER BY RANDOM() 
            LIMIT :limit
        """)
        result = db.execute(query, {"limit": limit})
        rows = result.fetchall()

        recs = []
        for row in rows:
            recs.append({
                "id": row.id,
                "name": row.name,
                "price": row.price,
                "image": row.image,
                "why": "인기 상품 (추천)",
                "why_en": "Popular picks (recommendation)",
                "confidence": 0.0
            })
        return recs
    except Exception as e:
        logger.error(f"DB Fallback failed: {e}")
        return []

# ---------------------------------------------------------
# 3. API 엔드포인트
# ---------------------------------------------------------

# ---------------------------------------------------------
# 3. API 엔드포인트
# ---------------------------------------------------------

class HybridRecommendRequest(BaseModel):
    product_id: Any  # int or string
    user_id: Optional[str] = None
    k: Optional[int] = None       # 프론트엔드/curl 대응
    top_n: Optional[int] = None   # 기존 규격 대응
    alpha: Optional[float] = None
    beta: Optional[float] = None

@router.post("/hybrid", response_model=RecommendResponse)
async def recommend_hybrid(
    req: HybridRecommendRequest,
    db: Session = Depends(get_db)
):
    try:
        # [추가] k 또는 top_n 중 있는 값을 사용, 둘 다 없으면 기본값 6 사용
        final_top_n = req.k or req.top_n or 6

        # [Case 1] 임베딩 모델이 아예 로드되지 않았을 때 -> DB Fallback
        if EMBEDDINGS is None or getattr(EMBEDDINGS, "size", 0) == 0 or FAISS is None:
            logger.warning("Embeddings not ready. Using DB fallback.")
            fallback_items = get_fallback_from_db(db, final_top_n)
            return {"recommendations": fallback_items}

        # ID 정규화 (str -> int)
        try:
            pid = int(req.product_id)
        except Exception:
            pid = req.product_id

        # [Case 2] 요청한 상품 ID가 인덱스에 없을 때 -> DB Fallback
        if pid not in prod_id_to_idx:
            logger.warning(f"Product ID {pid} not found in index. Using DB fallback.")
            fallback_items = get_fallback_from_db(db, final_top_n)
            return {"recommendations": fallback_items}

        # [Case 3] Redis 캐시 확인
        cached = None
        try:
            cached = get_cached_topk(pid)
        except Exception:
            cached = None

        if cached:
            # 캐시된 데이터가 요청한 개수보다 적을 수 있으므로 slice 처리 가능
            return {"recommendations": cached[:final_top_n]}

        # [Case 4] FAISS 검색 (유사도 계산)
        idx = prod_id_to_idx[pid]
        query_vec = EMBEDDINGS[idx]

        # 후보군은 요청 개수보다 넉넉하게 추출
        cand_k = max(50, final_top_n * 8)
        idxs, scores = FAISS.search(query_vec, top_k=cand_k)

        # 결과 정규화
        idxs = np.array(idxs).flatten() if idxs is not None else np.array([])
        scores = np.array(scores).flatten() if scores is not None else np.array([])

        if idxs.size == 0:
            return {"recommendations": get_fallback_from_db(db, final_top_n)}

        # 점수 스케일링
        arr = np.array(scores, dtype=float)
        arr_norm = (arr - np.min(arr)) / (np.ptp(arr) + 1e-9) if arr.size > 0 else arr

        # 상위 후보 추출
        top_k_limit = min(final_top_n * 2, idxs.size)
        top_idxs = idxs[:top_k_limit]

        candidate_pids = []
        for i in top_idxs:
            key = int(i)
            p = idx_to_prod.get(key)
            if p:
                candidate_pids.append(p.get("id"))

        # [Case 5] Redis 클릭 로그 반영 (Re-ranking)
        u_id = str(req.user_id) if req.user_id is not None else None
        try:
            boosts_list = boost_by_recent_clicks(u_id, candidate_pids) or []
        except Exception:
            boosts_list = []

        boosts = np.array(boosts_list + [0.0] * max(0, len(candidate_pids) - len(boosts_list)), dtype=float)

        # 최종 점수 합산 (유사도 + 부스팅)
        min_len = min(len(arr_norm), len(boosts))
        final_scores = arr_norm[:min_len] + boosts[:min_len]

        # 정렬 후 최종 요청 개수만큼 추출
        order = np.argsort(-final_scores)[:final_top_n]

        # [Case 6] 최종 결과 조립
        recs = []
        for pos in order:
            pos = int(pos)
            idx_pos = int(top_idxs[pos])
            p = idx_to_prod.get(idx_pos) or {}

            if not p: continue

            conf = float(min(1.0, float(final_scores[pos])))
            if pos < len(boosts) and boosts[pos] > 0:
                why = "최근 관심 반영"
                why_en = "Reflecting recent interest"
            else:
                why = "유사 상품"
                why_en = "Similar products"

            recs.append({
                "id": p.get("id"),
                "name": p.get("name"),
                "price": p.get("price"),
                "image": p.get("image"),
                "why": why,
                "why_en": why_en,
                "confidence": round(conf, 3)
            })

        # 캐싱
        try:
            set_cached_topk(pid, recs, ttl=3600)
        except:
            pass

        if not recs:
            return {"recommendations": get_fallback_from_db(db, final_top_n)}

        return {"recommendations": recs}

    except Exception as e:
        logger.error(f"recommend_hybrid exception: {e}\n{traceback.format_exc()}")
        try:
            return {"recommendations": get_fallback_from_db(db, 6)}
        except:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/{user_id}")
def recommend(user_id: str, db: Session = Depends(get_db)): # DB 의존성 추가
    try:
        # 1. Redis에서 최근 본 상품 가져오기
        items = redis_client.lrange(f"user:{user_id}:recent_items", 0, 9)
    except Exception:
        items = []

    if not items:
        # [수정됨] 2. Cold Start: 기록이 없으면 DB에서 인기/랜덤 상품 리턴
        logger.info(f"User {user_id} cold start -> Fetching random from DB")
        random_items = get_fallback_from_db(db, 6)

        # 프론트엔드가 기대하는 포맷으로 변환 (필요시)
        # 여기서는 단순 리스트 반환
        return {"source": "cold_start_db", "items": random_items}

    # 3. 기록이 있으면 (원래 로직 - 여기서는 stub 상태)
    # 실제로는 여기서 items를 기반으로 추천 알고리즘을 돌려야 함
    # 지금은 임시로 비어있는 리스트가 리턴되므로, 여기서도 Fallback 적용 가능

    return {"source": "redis_realtime", "items": []}
