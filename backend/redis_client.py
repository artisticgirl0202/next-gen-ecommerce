# backend/redis_client.py
import os
from redis.asyncio import Redis

# 환경변수에서 REDIS_URL을 가져옵니다.
# 로컬(도커) 환경을 위한 기본값으로 "redis://redis:6379"를 남겨둡니다.
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")

# from_url을 사용하면 Upstash의 rediss:// 주소를 읽어 자동으로 SSL(보안) 연결을 해줍니다!
redis = Redis.from_url(REDIS_URL, decode_responses=True)

# alias expected by other modules
redis_client = redis

# optional: export names
__all__ = ["redis", "redis_client"]
