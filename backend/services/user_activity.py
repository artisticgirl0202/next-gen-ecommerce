# backend/services/user_activity.py
import redis
import json

r = redis.Redis(host="localhost", port=6379, decode_responses=True)

def push_recent_click(user_id: int, product_id: int, max_len=30):
    key = f"user:{user_id}:recent_clicks"
    r.lpush(key, product_id)
    r.ltrim(key, 0, max_len-1)

def get_recent_clicks(user_id: int):
    key = f"user:{user_id}:recent_clicks"
    return [int(x) for x in r.lrange(key, 0, -1)]

def log_user_activity(user_id: int, product_id: int):
    push_recent_click(user_id, product_id)
