"""
backend/routers/recommend.py

ML models (FAISS, embeddings, sentence-transformers) are NOT loaded at import
time.  They are initialised on the first request that actually needs them.

Why: Render free tier has 512 MB RAM.  Loading torch + sentence-transformers +
faiss at startup immediately exceeds that limit and kills the process before any
request can be served (502 / OOM crash).  Lazy loading lets the auth/products
routes answer normally even when the ML stack is missing or slow to build.
"""
from __future__ import annotations

import logging
import threading
import traceback
from typing import Any, List, Optional

import numpy as np
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.redis_client import redis_client
from backend.schemas.recommend import RecommendResponse
from backend.services.cache import boost_by_recent_clicks, get_cached_topk, set_cached_topk

logger = logging.getLogger("recommend")
router = APIRouter()

# ---------------------------------------------------------------------------
# Lazy ML state
# ---------------------------------------------------------------------------
# Nothing is imported or allocated here.  The _ensure_ml_ready() call inside
# each route handler initialises the state exactly once on the first request.

_ml_lock = threading.Lock()
_ml_initialized: bool = False

_PRODUCTS: List[dict] = []
_prod_id_to_idx: dict = {}
_idx_to_prod: dict = {}
_EMBEDDINGS: Optional[np.ndarray] = None
_FAISS = None   # FaissIndex or None
_DIN = None     # DINReRanker or None


def _ensure_ml_ready() -> None:
    """
    Initialise ML models on the first call; subsequent calls return immediately.
    All heavy imports (torch, faiss, sentence-transformers) live inside this
    function so they never execute at module-import time.
    """
    global _ml_initialized, _PRODUCTS, _prod_id_to_idx, _idx_to_prod
    global _EMBEDDINGS, _FAISS, _DIN

    if _ml_initialized:
        return

    with _ml_lock:
        if _ml_initialized:          # double-checked locking
            return

        logger.info("⏳ Lazy-loading ML models (first /recommend request)…")
        try:
            # These imports are intentionally deferred — they pull in torch etc.
            from backend.embedding import load_embeddings, load_products
            from backend.recommender import DINReRanker, FaissIndex

            # ── products catalogue ────────────────────────────────────────
            _PRODUCTS = load_products() or []
            for i, p in enumerate(_PRODUCTS):
                try:
                    pid = int(p.get("id"))
                except Exception:
                    pid = p.get("id")
                _prod_id_to_idx[pid] = i
                _idx_to_prod[i] = p

            # ── embeddings + FAISS index ──────────────────────────────────
            _EMBEDDINGS = load_embeddings()
            if _EMBEDDINGS is not None and getattr(_EMBEDDINGS, "size", 0) > 0:
                try:
                    _FAISS = FaissIndex(_EMBEDDINGS)
                except Exception:
                    logger.exception("FaissIndex init failed — will use DB fallback")
                    _FAISS = None

                try:
                    emb_dim = (
                        _EMBEDDINGS.shape[1]
                        if getattr(_EMBEDDINGS, "ndim", 0) >= 2
                        else 128
                    )
                    _DIN = DINReRanker(emb_dim=emb_dim)
                except Exception:
                    logger.exception("DINReRanker init failed — skipping re-ranking")
                    _DIN = None

            logger.info(
                "✅ ML ready — products=%d  FAISS=%s  DIN=%s",
                len(_PRODUCTS),
                "✓" if _FAISS else "✗",
                "✓" if _DIN else "✗",
            )

        except Exception as exc:
            # Catch-all: ML unavailable — routes fall back to DB automatically
            logger.error("ML initialisation failed (%s) — all routes will use DB fallback", exc)

        finally:
            # Always mark as done so we don't retry on every request
            _ml_initialized = True


# ---------------------------------------------------------------------------
# DB fallback helper
# ---------------------------------------------------------------------------

def _get_fallback_from_db(db: Session, limit: int = 6) -> List[dict]:
    """Return random products from Postgres when ML is unavailable."""
    try:
        rows = db.execute(
            text("""
                SELECT id, name, price, image, category, description
                FROM products
                ORDER BY RANDOM()
                LIMIT :limit
            """),
            {"limit": limit},
        ).fetchall()
        return [
            {
                "id": r.id,
                "name": r.name,
                "price": float(r.price or 0),
                "image": r.image,
                "why": "Popular picks",
                "why_en": "Popular picks (recommendation)",
                "confidence": 0.0,
            }
            for r in rows
        ]
    except Exception as exc:
        logger.error("DB fallback failed: %s", exc)
        return []


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class HybridRecommendRequest(BaseModel):
    product_id: Any
    user_id: Optional[str] = None
    k: Optional[int] = None
    top_n: Optional[int] = None
    alpha: Optional[float] = None
    beta: Optional[float] = None


# ---------------------------------------------------------------------------
# POST /hybrid
# ---------------------------------------------------------------------------

@router.post("/hybrid", response_model=RecommendResponse)
async def recommend_hybrid(req: HybridRecommendRequest, db: Session = Depends(get_db)):
    # Initialise ML on first call — no-op on subsequent calls
    _ensure_ml_ready()

    final_top_n: int = req.k or req.top_n or 6

    try:
        # ── Case 1: ML stack unavailable ─────────────────────────────────
        if _EMBEDDINGS is None or getattr(_EMBEDDINGS, "size", 0) == 0 or _FAISS is None:
            logger.warning("ML not ready — DB fallback for product_id=%s", req.product_id)
            return {"recommendations": _get_fallback_from_db(db, final_top_n)}

        # ── Normalise product ID ──────────────────────────────────────────
        try:
            pid = int(req.product_id)
        except Exception:
            pid = req.product_id

        # ── Case 2: product not in index ─────────────────────────────────
        if pid not in _prod_id_to_idx:
            logger.warning("Product %s not in ML index — DB fallback", pid)
            return {"recommendations": _get_fallback_from_db(db, final_top_n)}

        # ── Case 3: Redis cache hit ───────────────────────────────────────
        cached = None
        try:
            cached = get_cached_topk(pid)
        except Exception:
            pass
        if cached:
            return {"recommendations": cached[:final_top_n]}

        # ── Case 4: FAISS search ──────────────────────────────────────────
        idx = _prod_id_to_idx[pid]
        query_vec = _EMBEDDINGS[idx]
        cand_k = max(50, final_top_n * 8)
        idxs, scores = _FAISS.search(query_vec, top_k=cand_k)

        idxs = np.array(idxs).flatten() if idxs is not None else np.array([])
        scores = np.array(scores).flatten() if scores is not None else np.array([])

        if idxs.size == 0:
            return {"recommendations": _get_fallback_from_db(db, final_top_n)}

        arr = np.array(scores, dtype=float)
        arr_norm = (
            (arr - np.min(arr)) / (np.ptp(arr) + 1e-9) if arr.size > 0 else arr
        )

        top_k_limit = min(final_top_n * 2, idxs.size)
        top_idxs = idxs[:top_k_limit]

        candidate_pids = [
            _idx_to_prod[int(i)].get("id")
            for i in top_idxs
            if _idx_to_prod.get(int(i))
        ]

        # ── Case 5: Redis re-ranking boost ───────────────────────────────
        u_id = str(req.user_id) if req.user_id is not None else None
        try:
            boosts_list = boost_by_recent_clicks(u_id, candidate_pids) or []
        except Exception:
            boosts_list = []

        boosts = np.array(
            boosts_list + [0.0] * max(0, len(candidate_pids) - len(boosts_list)),
            dtype=float,
        )
        min_len = min(len(arr_norm), len(boosts))
        final_scores = arr_norm[:min_len] + boosts[:min_len]
        order = np.argsort(-final_scores)[:final_top_n]

        # ── Case 6: Assemble results ──────────────────────────────────────
        recs = []
        for pos in order:
            pos = int(pos)
            p = _idx_to_prod.get(int(top_idxs[pos])) or {}
            if not p:
                continue
            conf = float(min(1.0, float(final_scores[pos])))
            why_en = (
                "Reflecting recent interest"
                if pos < len(boosts) and boosts[pos] > 0
                else "Similar products"
            )
            recs.append(
                {
                    "id": p.get("id"),
                    "name": p.get("name"),
                    "price": p.get("price"),
                    "image": p.get("image"),
                    "why": why_en,
                    "why_en": why_en,
                    "confidence": round(conf, 3),
                }
            )

        # Cache and return
        try:
            set_cached_topk(pid, recs, ttl=3600)
        except Exception:
            pass

        return {"recommendations": recs or _get_fallback_from_db(db, final_top_n)}

    except Exception as exc:
        logger.error("recommend_hybrid error: %s\n%s", exc, traceback.format_exc())
        fallback = _get_fallback_from_db(db, 6)
        if fallback:
            return {"recommendations": fallback}
        raise HTTPException(status_code=500, detail="Recommendation service temporarily unavailable.")


# ---------------------------------------------------------------------------
# GET /recommendations/{user_id}
# ---------------------------------------------------------------------------

@router.get("/recommendations/{user_id}")
def recommend(user_id: str, db: Session = Depends(get_db)):
    try:
        items = redis_client.lrange(f"user:{user_id}:recent_items", 0, 9)
    except Exception:
        items = []

    if not items:
        logger.info("Cold-start for user %s — serving random DB items", user_id)
        return {"source": "cold_start_db", "items": _get_fallback_from_db(db, 6)}

    return {"source": "redis_realtime", "items": []}
