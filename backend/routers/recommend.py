# backend/routers/recommend.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import traceback, logging
from backend.redis_client import redis_client
import json
from backend.schemas.recommend import RecommendRequest, RecommendResponse, ProductOut
from backend.embedding import load_products, load_embeddings
from backend.recommender import FaissIndex, DINReRanker
from backend.services.cache import get_cached_topk, set_cached_topk, boost_by_recent_clicks

logger = logging.getLogger("recommend")
router = APIRouter()

PRODUCTS = load_products()
prod_id_to_idx = {p["id"]: i for i,p in enumerate(PRODUCTS)}
idx_to_prod = {i:p for i,p in enumerate(PRODUCTS)}

EMBEDDINGS = load_embeddings()
FAISS = FaissIndex(EMBEDDINGS)
DIN = DINReRanker(emb_dim=(EMBEDDINGS.shape[1] if EMBEDDINGS.size else 128))



class HybridRecommendRequest(BaseModel):
    product_id: int
    user_id: Optional[str] = None
    top_n: int = 6
    alpha: Optional[float] = None
    beta: Optional[float] = None

# 기존에 두 개 있던 /hybrid 함수를 하나로 통합합니다.
@router.post("/hybrid", response_model=RecommendResponse)
async def recommend_hybrid(req: HybridRecommendRequest):  # 인자 타입을 위에서 만든 클래스로 변경
    try:
        # 1. 임베딩 데이터가 없을 경우 처리
        if EMBEDDINGS is None or EMBEDDINGS.size == 0:
            sample = [p for p in PRODUCTS[:req.top_n]]
            return {"recommendations":[{"id":p["id"], "name":p.get("name"), "price":p.get("price"), "image":p.get("image")} for p in sample]}

        # 2. 상품 ID 존재 확인
        if req.product_id not in prod_id_to_idx:
            logger.warning(f"Product ID {req.product_id} not found in index.")
            return {"recommendations": []}

        # 3. 캐시 확인
        cached = get_cached_topk(req.product_id)
        if cached:
            return {"recommendations": cached}

        # 4. 유사도 검색 (FAISS)
        idx = prod_id_to_idx[req.product_id]
        query_vec = EMBEDDINGS[idx]
        cand_k = max(50, req.top_n * 8)

        idxs, scores = FAISS.search(query_vec, top_k=cand_k)
        if not idxs:
            return {"recommendations": []}

        # 5. 점수 정규화 및 리랭킹 로직
        arr = np.array(scores, dtype=float)
        arr_norm = (arr - np.min(arr)) / (np.ptp(arr) + 1e-9) if arr.size > 0 else arr

        top_idxs = idxs[:req.top_n]
        candidate_pids = [idx_to_prod[i]["id"] for i in top_idxs]

        # 최근 클릭 부스팅 (Redis 연동)
        u_id = str(req.user_id) if req.user_id is not None else None
        boosts = np.array(boost_by_recent_clicks(u_id, candidate_pids))

        final_scores = arr_norm[:len(top_idxs)] + boosts
        order = np.argsort(-final_scores)[:req.top_n]

        # 6. 결과 조립
        recs = []
        for rank, pos in enumerate(order):
            i = top_idxs[pos]
            p = idx_to_prod[i]
            conf = float(min(1.0, float(final_scores[pos])))
            why = "최근 클릭 반영" if boosts[pos] > 0 else "콘텐츠 유사"
            recs.append({
                "id": p["id"],
                "name": p.get("name"),
                "price": p.get("price"),
                "image": p.get("image"),
                "why": why,
                "confidence": round(conf, 3)
            })

        # 캐시 저장
        try:
            set_cached_topk(req.product_id, recs, ttl=3600)
        except Exception:
            logger.exception("cache failed")

        return {"recommendations": recs}

    except Exception as e:
        logger.error(f"recommend_hybrid exception: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/{user_id}")
def recommend(user_id: str):
    # 1. 최근 행동
    items = redis_client.lrange(f"user:{user_id}:recent_items", 0, 9)

    if not items:
        return {"source": "cold_start", "items": popular_items()}

    # 2. Candidate Recall (임시)
    candidates = recall_candidates(items)

    # 3. Re-ranking
    ranked = rerank(candidates, items)

    return {
        "source": "redis_realtime",
        "items": ranked
    }
