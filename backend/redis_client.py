# backend/redis_client.py
import os
from redis.asyncio import Redis

REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "") or None

# async client (used by async code)
redis = Redis(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD, decode_responses=True)

# alias expected by other modules
redis_client = redis

# optional: export names
__all__ = ["redis", "redis_client"]
