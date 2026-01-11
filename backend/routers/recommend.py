# backend/routers/recommend.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import traceback, logging
from backend.redis_client import redis_client
import json
from backend.schemas.recommend import RecommendResponse
from backend.embedding import load_products, load_embeddings
from backend.recommender import FaissIndex, DINReRanker
from backend.services.cache import get_cached_topk, set_cached_topk, boost_by_recent_clicks

logger = logging.getLogger("recommend")
router = APIRouter()

# Load products safely
PRODUCTS = load_products() or []
# Build maps with normalized int keys when possible
prod_id_to_idx = {}
idx_to_prod = {}
for i, p in enumerate(PRODUCTS):
    try:
        pid = int(p.get("id"))
    except Exception:
        pid = p.get("id")
    prod_id_to_idx[pid] = i
    idx_to_prod[i] = p

# Load embeddings and init index safely
EMBEDDINGS = load_embeddings()
FAISS = None
DIN = None
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

class HybridRecommendRequest(BaseModel):
    product_id: int
    user_id: Optional[str] = None
    top_n: int = 6
    alpha: Optional[float] = None
    beta: Optional[float] = None

@router.post("/hybrid", response_model=RecommendResponse)
async def recommend_hybrid(req: HybridRecommendRequest):
    try:
        # 1. If embeddings/index not available, fallback to simple sample
        if EMBEDDINGS is None or getattr(EMBEDDINGS, "size", 0) == 0 or FAISS is None:
            sample = [p for p in PRODUCTS[: req.top_n]]
            return {"recommendations": [{"id": p["id"], "name": p.get("name"), "price": p.get("price"), "image": p.get("image"), "why": "fallback", "confidence": 0.0} for p in sample]}

        # normalize product id
        try:
            pid = int(req.product_id)
        except Exception:
            pid = req.product_id

        # 2. Product present?
        if pid not in prod_id_to_idx:
            logger.warning(f"Product ID {pid} not found in index.")
            return {"recommendations": []}

        # 3. Cache
        cached = None
        try:
            cached = get_cached_topk(pid)
        except Exception:
            logger.exception("cache lookup failed")
            cached = None
        if cached:
            return {"recommendations": cached}

        # 4. FAISS recall
        idx = prod_id_to_idx[pid]
        query_vec = EMBEDDINGS[idx]
        cand_k = max(50, req.top_n * 8)

        idxs, scores = FAISS.search(query_vec, top_k=cand_k)
        # normalize shapes
        idxs = np.array(idxs).flatten() if idxs is not None else np.array([])
        scores = np.array(scores).flatten() if scores is not None else np.array([])

        if idxs.size == 0:
            return {"recommendations": []}

        # 5. Score normalization and re-ranking
        arr = np.array(scores, dtype=float)
        arr_norm = (arr - np.min(arr)) / (np.ptp(arr) + 1e-9) if arr.size > 0 else arr

        top_k = min(req.top_n, idxs.size)
        top_idxs = idxs[:top_k]

        candidate_pids = []
        for i in top_idxs:
            # i might be numpy type; coerce to int for map lookup
            key = int(i) if np.isscalar(i) else int(i)
            p = idx_to_prod.get(key) or idx_to_prod.get(int(key))
            if p is None:
                continue
            candidate_pids.append(p.get("id"))

        # recent-click boosts (redis)
        u_id = str(req.user_id) if req.user_id is not None else None
        try:
            boosts_list = boost_by_recent_clicks(u_id, candidate_pids) or []
        except Exception:
            logger.exception("boost_by_recent_clicks failed")
            boosts_list = []

        # pad boosts to match candidate length
        boosts = np.array(boosts_list + [0.0] * max(0, len(candidate_pids) - len(boosts_list)), dtype=float)

        # compute final scores (ensure matching lengths)
        arr_for_top = arr_norm[: len(top_idxs)]
        boosts_for_top = boosts[: len(top_idxs)]
        final_scores = arr_for_top + boosts_for_top

        order = np.argsort(-final_scores)[: req.top_n]

        # 6. Assemble results
        recs = []
        for rank_index, pos in enumerate(order):
            pos = int(pos)
            idx_pos = int(top_idxs[pos])
            p = idx_to_prod.get(idx_pos) or {}
            conf = float(min(1.0, float(final_scores[pos]))) if pos < len(final_scores) else 0.0
            why = "최근 클릭 반영" if (pos < len(boosts) and boosts[pos] > 0) else "콘텐츠 유사"
            recs.append({
                "id": p.get("id"),
                "name": p.get("name"),
                "price": p.get("price"),
                "image": p.get("image"),
                "why": why,
                "confidence": round(conf, 3)
            })

        # Cache store (best-effort)
        try:
            set_cached_topk(pid, recs, ttl=3600)
        except Exception:
            logger.exception("cache failed")

        return {"recommendations": recs}

    except Exception as e:
        logger.error(f"recommend_hybrid exception: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommendations/{user_id}")
def recommend(user_id: str):
    try:
        items = redis_client.lrange(f"user:{user_id}:recent_items", 0, 9)
    except Exception:
        logger.exception("redis lrange failed")
        items = []

    if not items:
        # returning empty list instead of calling undefined popular_items()
        return {"source": "cold_start", "items": []}

    # Candidate recall and rerank are project-specific; return stub
    candidates = []
    ranked = candidates

    return {"source": "redis_realtime", "items": ranked}
