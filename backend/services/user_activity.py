# backend/services/user_activity.py
import redis
import json

# Redis 설정 (호스트명은 docker-compose 네트워크 상황에 맞게 설정. 로컬 테스트시 localhost, 도커 내부 통신시 redis 등)
# 현재 에러 로그를 보면 연결은 되고 있으므로 기존 설정 유지
r = redis.Redis(host="redis", port=6379, decode_responses=True)
# 주의: 만약 로컬에서 직접 python 실행 중이라면 host="localhost"로 해야 함.
# 도커 내부라면 host="redis" (또는 서비스명)가 맞음.

# 1. action 인자 추가 및 order_id 타입 str로 변경
def push_recent_click(user_id: int, product_id: int, order_id: str = None, action: str = None, max_len=30):
    key = f"user:{user_id}:recent_clicks"

    # Redis에 저장할 데이터 구성 (action 추가됨)
    data = {
        "product_id": product_id,
        "order_id": order_id,
        "action": action  # <--- 여기 추가됨
    }

    # 딕셔너리를 JSON 문자열로 변환
    value = json.dumps(data)

    r.lpush(key, value)
    r.ltrim(key, 0, max_len-1)

# 2. JSON 데이터를 읽어오는 함수 (기존 유지)
def get_recent_clicks(user_id: int):
    key = f"user:{user_id}:recent_clicks"
    raw_data = r.lrange(key, 0, -1)

    result = []
    for x in raw_data:
        try:
            # 저장된 JSON 문자열을 다시 딕셔너리로 변환
            result.append(json.loads(x))
        except json.JSONDecodeError:
            continue # 혹시 모를 데이터 깨짐 방지

    return result

# 3. 상위 함수에도 action 인자 추가
def log_user_activity(user_id: int, product_id: int, order_id: str = None, action: str = None):
    # 인자를 그대로 전달
    push_recent_click(user_id, product_id, order_id, action)
