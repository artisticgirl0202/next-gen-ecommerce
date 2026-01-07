# backend/services/cache.py
"""
Redis-backed cache & small helper for recommendation system.

Provides:
- get_cached_topk / set_cached_topk           (cached item top-k lists)
- push_user_history / get_user_history        (session recent history, used elsewhere)
- add_recent_click / get_recent_clicks        (recent clicks list)
- boost_by_recent_clicks                      (score boosts for candidates)
All functions are robust: if Redis is unreachable, use an in-memory fallback.
"""

from typing import List, Optional, Any
import os
import json
import threading
import redis

try:
    import redis
except Exception:
    redis = None

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# If redis is available, create client; else use None and fallback to in-memory
_redis_client = None
if redis is not None:
    try:
        _redis_client = redis.from_url(REDIS_URL, decode_responses=True)
    except Exception:
        _redis_client = None

# In-memory fallback stores (thread-safe)
_mem_lock = threading.Lock()
_MEM = {
    "item:topk": {},          # item_id -> json string
    "user:history": {},       # user_id -> list of product_ids (recent)
    "user:recent_clicks": {}, # user_id -> list of product_ids (recent)
}

# Keys / constants
RECENT_CLICK_KEY = "user:{user_id}:recent_clicks"
RECENT_HISTORY_KEY = "user:{user_id}:recent_history"
TOPK_KEY = "item:topk:{item_id}"
MAX_RECENT = int(os.getenv("MAX_RECENT", "20"))
HISTORY_MAX = int(os.getenv("HISTORY_MAX", "50"))
r = redis.Redis(host=os.getenv("REDIS_HOST","redis"), port=int(os.getenv("REDIS_PORT",6379)), decode_responses=True)

# ---------------------------
# Redis wrapper helpers
# ---------------------------
def _r_get(key: str) -> Optional[str]:
    if _redis_client is None:
        return None
    try:
        return _redis_client.get(key)
    except Exception:
        return None

def _r_set(key: str, value: str, ex: Optional[int] = None) -> bool:
    if _redis_client is None:
        return False
    try:
        if ex:
            _redis_client.set(key, value, ex=ex)
        else:
            _redis_client.set(key, value)
        return True
    except Exception:
        return False

def _r_lpush(key: str, value: str) -> bool:
    if _redis_client is None:
        return False
    try:
        _redis_client.lrem(key, 0, value)  # remove duplicates
        _redis_client.lpush(key, value)
        return True
    except Exception:
        return False

def _r_ltrim(key: str, start: int, end: int) -> bool:
    if _redis_client is None:
        return False
    try:
        _redis_client.ltrim(key, start, end)
        return True
    except Exception:
        return False

def _r_lrange(key: str, start: int, end: int) -> Optional[List[str]]:
    if _redis_client is None:
        return None
    try:
        return _redis_client.lrange(key, start, end)
    except Exception:
        return None


# ---------------------------
# Top-k cache (item -> list of items)
# ---------------------------
def get_cached_topk(item_id: int) -> Optional[Any]:
    key = TOPK_KEY.format(item_id=item_id)
    # try redis
    v = _r_get(key)
    if v is not None:
        try:
            return json.loads(v)
        except Exception:
            return None
    # fallback: in-memory
    with _mem_lock:
        return _MEM["item:topk"].get(str(item_id))


def set_cached_topk(item_id: int, items: Any, ttl: int = 3600) -> None:
    key = TOPK_KEY.format(item_id=item_id)
    payload = json.dumps(items, ensure_ascii=False)
    if not _r_set(key, payload, ex=ttl):
        with _mem_lock:
            _MEM["item:topk"][str(item_id)] = items


# ---------------------------
# User recent history (for short-term personalization)
# ---------------------------
def push_user_history(user_id: str, product_id: int, max_len: int = HISTORY_MAX) -> None:
    key = RECENT_HISTORY_KEY.format(user_id=user_id)
    val = str(product_id)
    ok = _r_lpush(key, val)
    if ok:
        _r_ltrim(key, 0, max_len - 1)
        return
    # fallback
    with _mem_lock:
        lst = _MEM["user:history"].setdefault(user_id, [])
        if val in lst:
            lst.remove(val)
        lst.insert(0, val)
        _MEM["user:history"][user_id] = lst[:max_len]


def get_user_history(user_id: str, limit: int = 20) -> List[int]:
    key = RECENT_HISTORY_KEY.format(user_id=user_id)
    res = _r_lrange(key, 0, limit - 1)
    if res is not None:
        try:
            return [int(x) for x in res]
        except Exception:
            return []
    with _mem_lock:
        lst = _MEM["user:history"].get(user_id, [])
        return [int(x) for x in lst[:limit]]


# ---------------------------
# Recent clicks (separate list for clicks)
# ---------------------------
def add_recent_click(user_id: str, product_id: int, max_recent: int = MAX_RECENT) -> None:
    key = RECENT_CLICK_KEY.format(user_id=user_id)
    val = str(product_id)
    ok = _r_lpush(key, val)
    if ok:
        _r_ltrim(key, 0, max_recent - 1)
        return
    with _mem_lock:
        lst = _MEM["user:recent_clicks"].setdefault(user_id, [])
        if val in lst:
            lst.remove(val)
        lst.insert(0, val)
        _MEM["user:recent_clicks"][user_id] = lst[:max_recent]


def get_recent_clicks(user_id: str, limit: int = MAX_RECENT) -> List[int]:
    key = RECENT_CLICK_KEY.format(user_id=user_id)
    res = _r_lrange(key, 0, limit - 1)
    if res is not None:
        try:
            return [int(x) for x in res]
        except Exception:
            return []
    with _mem_lock:
        lst = _MEM["user:recent_clicks"].get(user_id, [])
        return [int(x) for x in lst[:limit]]


# ---------------------------
# Boost calculation (used by recommender)
# ---------------------------
def boost_by_recent_clicks(
    user_id: Optional[str],
    candidate_product_ids: List[int],
    boost: float = 0.15
) -> List[float]:
    """
    Return a list of boost values aligned with candidate_product_ids.
    If user_id is falsy, return zeros.
    """
    if not user_id:
        return [0.0] * len(candidate_product_ids)
    recent = set(get_recent_clicks(user_id))
    return [boost if pid in recent else 0.0 for pid in candidate_product_ids]
def add_recent_order(user_id: str, order_no: str, max_len=30):
    key = f"user:{user_id}:recent_orders"
    r.lpush(key, order_no)
    r.ltrim(key, 0, max_len-1)
