import redis, os, json
r = redis.Redis(host=os.getenv("REDIS_HOST","localhost"), port=int(os.getenv("REDIS_PORT",6379)), decode_responses=True)
items = []
for i in range(1,401):
    items.append({"id": i, "name": f"Demo Product {i}", "price": (i*13)%1000 + 10, "category":"Demo"})
# store as list
r.delete("items:list")
for it in items:
    r.rpush("items:list", json.dumps(it))
print("seeded", len(items))
