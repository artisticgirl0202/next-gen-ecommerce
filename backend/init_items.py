import redis, os, json

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
r = redis.from_url(REDIS_URL, decode_responses=True)
items = []
for i in range(1,401):
    items.append({
        "id": i,
        "name": f"Demo Product {i}",
        "brand": f"Demo Brand {i % 10}",
        "price": (i*13)%1000 + 10,
        "category":"Demo"
    })
# store as list
r.delete("items:list")
for it in items:
    r.rpush("items:list", json.dumps(it))
print("seeded", len(items))
