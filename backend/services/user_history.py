
import json
import time
from backend.redis_client import redis

MAX_RECENT = 50  # DIN 입력 최대 길이

def push_user_history(user_id: str, item_id: int, event_type: str):
    ts = int(time.time())

    key_items = f"user:{user_id}:recent_items"
    key_events = f"user:{user_id}:recent_events"
    key_count = f"user:{user_id}:event_count"
    key_active = f"user:{user_id}:last_active"

    pipe = redis_client.pipeline()

    # 1. 최근 아이템
    pipe.lpush(key_items, item_id)
    pipe.ltrim(key_items, 0, MAX_RECENT - 1)

    # 2. 상세 이벤트
    event = {
        "item_id": item_id,
        "type": event_type,
        "ts": ts
    }
    pipe.lpush(key_events, json.dumps(event))
    pipe.ltrim(key_events, 0, MAX_RECENT - 1)

    # 3. 카운트
    pipe.hincrby(key_count, event_type, 1)

    # 4. TTL / Active
    pipe.set(key_active, ts)
    pipe.expire(key_items, 60 * 60 * 24 * 7)
    pipe.expire(key_events, 60 * 60 * 24 * 7)
    pipe.expire(key_count, 60 * 60 * 24 * 7)

    pipe.execute()
