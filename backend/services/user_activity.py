# backend/services/user_activity.py
import os
import json
import logging
from typing import Union, Optional

logger = logging.getLogger(__name__)

# ── Redis 클라이언트 (연결 실패 시 None으로 폴백) ──────────────────────────
# REDIS_URL 환경변수 우선 사용 → 없으면 REDIS_HOST/PORT 조합
# docker-compose 내부: redis://redis:6379/0
# 로컬 직접 실행:      redis://localhost:6379/0
_r = None
try:
    import redis as _redis_mod
    _REDIS_URL = os.getenv("REDIS_URL", f"redis://{os.getenv('REDIS_HOST', 'redis')}:{os.getenv('REDIS_PORT', 6379)}/0")
    _r = _redis_mod.from_url(_REDIS_URL, decode_responses=True)
    _r.ping()  # 기동 시점에 연결 가능 여부 확인
    logger.info("user_activity: Redis connected at %s", _REDIS_URL)
except Exception as _e:
    logger.warning("user_activity: Redis unavailable (%s) — writes will be silently skipped", _e)
    _r = None


def push_recent_click(
    user_id: Union[int, str],
    product_id: Optional[Union[int, str]] = None,
    order_id: Optional[Union[int, str]] = None,
    action: Optional[str] = None,
    max_len: int = 30,
) -> bool:
    """
    사용자의 최근 클릭/액션을 Redis 리스트에 저장합니다.
    Redis가 없으면 False를 반환하고 예외를 발생시키지 않습니다.
    """
    if _r is None:
        return False
    try:
        key = f"user:{user_id}:recent_clicks"
        value = json.dumps(
            {"product_id": product_id, "order_id": str(order_id) if order_id else None, "action": action},
            ensure_ascii=False,
        )
        _r.lpush(key, value)
        _r.ltrim(key, 0, max_len - 1)
        return True
    except Exception as e:
        logger.warning("push_recent_click failed: %s", e)
        return False


def get_recent_clicks(user_id: Union[int, str], limit: int = 30) -> list:
    """사용자의 최근 클릭 목록을 반환합니다. Redis 불가 시 빈 리스트 반환."""
    if _r is None:
        return []
    try:
        key = f"user:{user_id}:recent_clicks"
        raw_data = _r.lrange(key, 0, limit - 1)
        result = []
        for x in raw_data:
            try:
                result.append(json.loads(x))
            except json.JSONDecodeError:
                continue
        return result
    except Exception as e:
        logger.warning("get_recent_clicks failed: %s", e)
        return []


def log_user_activity(
    user_id: Union[int, str],
    order_id: Optional[Union[int, str]] = None,
    action: Optional[str] = None,
    product_id: Optional[Union[int, str]] = None,
) -> bool:
    """
    interact.py의 호출 시그니처:
        log_user_activity(user_id=..., order_id=..., action=...)
    와 정확히 일치하도록 파라미터 순서를 맞췄습니다.
    product_id는 선택 인자로 하위 호환성을 유지합니다.
    """
    return push_recent_click(
        user_id=user_id,
        product_id=product_id,
        order_id=order_id,
        action=action,
    )
