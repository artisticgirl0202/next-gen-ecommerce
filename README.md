# TECH.CO: Event-Driven E-Commerce Platform with Hybrid AI Recommendation Pipeline

**TECH.CO** is a scalable, full-stack e-commerce platform architected around real-time event flows and AI-driven product personalization. The backend features a decoupled, event-driven operational backbone using Apache Kafka, and a multi-tiered hybrid recommendation engine with deterministic fallback guarantees.

---

## System Architecture

Unlike synchronous CRUD applications, TECH.CO is designed for **decoupling and system reliability**, separating transactional operations from downstream analytics and ML processes.

### 1. Event-Driven Operational Backbone

**Asynchronous Event Publishing via Apache Kafka**

The Orders API persists the order to PostgreSQL first, then publishes an `ORDER_CREATED` payload to the `order.events` Kafka topic in a fire-and-forget manner. Core business operations are never blocked by downstream ML or analytics consumers.

Source: `backend/services/order_service.py`
```python
# DB persist (always runs first)
db.add(order)
db.commit()
db.refresh(order)

# Publish Kafka event (non-fatal)
try:
    send_user_event(event_payload, topic="order.events")
except Exception:
    # Fallback: append event payload to local file
    with FALLBACK_FILE.open("a", encoding="utf-8") as f:
        f.write(json.dumps({"topic": "order.events", "payload": event_payload}) + "\n")
```

**User Interaction Streaming**

User events (click, view, buy) are captured at `POST /events/` and written to Redis immediately, then forwarded to the `user-events` Kafka topic when `ENABLE_KAFKA=true`. The Redis write is unconditional and never blocked by Kafka availability.

Source: `backend/routers/events.py`
```python
@router.post("/")
async def send_event(event: UserEvent):
    # Always executes: writes to Redis regardless of Kafka state
    push_user_history(user_id=event.user_id, item_id=event.item_id, event_type=event.event_type)

    # Only executes when Kafka is enabled
    if ENABLE_KAFKA and producer:
        await producer.send_and_wait(TOPIC, event.json().encode())
```

**Kafka Consumer**

A standalone consumer (`backend/consumer/order_event_consumer.py`) subscribes to `order.events` and appends each event to a `.jsonl` file, forming the ingress layer for offline ML training and analytics pipelines.

---

### 2. Hybrid Recommendation Engine

The recommendation endpoint (`POST /api/recommend/hybrid`) combines semantic vector search, Redis-based user history, and a configurable re-ranking step.

**Pipeline (executed in order):**

1. **Redis cache hit** — return cached top-k immediately (TTL: 3600s)
2. **FAISS search** — inner-product nearest-neighbor search over `sentence-transformers/all-MiniLM-L6-v2` embeddings (`faiss.IndexFlatIP`)
3. **Redis click boost** — candidates recently clicked by the requesting user receive a +0.15 score boost
4. **Final ranking** — `normalized_similarity + click_boost`, sorted descending
5. **Cache write** — result written back to Redis

Source: `backend/routers/recommend.py` (Case 3-6), `backend/services/cache.py`

**Explainability fields returned per recommendation:**

| Field | Description | Values (code) |
|---|---|---|
| `why` | Korean explanation label | `"최근 관심 반영"` / `"유사 상품"` |
| `why_en` | English explanation label | `"Reflecting recent interest"` / `"Similar products"` |
| `confidence` | Normalized score [0.0, 1.0] | float, rounded to 3 decimal places |

Source: `backend/routers/recommend.py`
```python
if pos < len(boosts) and boosts[pos] > 0:
    why = "최근 관심 반영"
    why_en = "Reflecting recent interest"
else:
    why = "유사 상품"
    why_en = "Similar products"

recs.append({
    "id": p.get("id"), "name": p.get("name"), "price": p.get("price"),
    "image": p.get("image"), "why": why, "why_en": why_en,
    "confidence": round(conf, 3)
})
```

---

### 3. Multi-Tiered Embedding Fallback Strategy

The embedding pipeline enforces a 3-level fallback to guarantee service continuity in CPU-only or resource-constrained environments.

| Level | Method | Condition |
|---|---|---|
| 1 (Primary) | `sentence-transformers/all-MiniLM-L6-v2` (SBERT) | `sentence_transformers` importable |
| 2 (Fallback) | `TF-IDF + TruncatedSVD` (scikit-learn, 128-dim) | `sklearn` available, `sentence_transformers` not |
| 3 (Emergency) | Char-hash vectorization (bag-of-bytes, deterministic) | Neither library available |

All embeddings are unit-normalized (L2) before storage and saved to `backend/data/product_embeddings.npy` to prevent recomputation on container restarts.

Source: `backend/embedding.py`
```python
# Level 1
if _HAS_STS:
    emb = model.encode(texts, batch_size=batch_size, convert_to_numpy=True)

# Level 2
elif _HAS_SK:
    vec = TfidfVectorizer(max_features=20000, ngram_range=(1, 2))
    X = vec.fit_transform(texts)
    svd = TruncatedSVD(n_components=svd_dim, random_state=42)
    emb = svd.fit_transform(X).astype(np.float32)

# Level 3
else:
    emb = np.zeros((N, D), dtype=np.float32)
    for i, t in enumerate(texts):
        for j, ch in enumerate(t.encode("utf-8")[:1024]):
            emb[i, j % D] += ch / 255.0

# Unit-normalize and cache
norms = np.linalg.norm(emb, axis=1, keepdims=True)
emb = emb / norms
np.save(EMBED_FILE, emb)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Python, FastAPI, Uvicorn |
| Database | PostgreSQL (SQLAlchemy ORM) |
| Event Broker | Apache Kafka (aiokafka, confluent-kafka) |
| Cache / Session Store | Redis 7 |
| Vector Search | FAISS (`faiss-cpu`, `IndexFlatIP`) |
| Embeddings | sentence-transformers (`all-MiniLM-L6-v2`), scikit-learn (fallback) |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Zustand, TanStack React Query |
| Infrastructure | Docker, Docker Compose |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

---

## Getting Started (Local Development)

All infrastructure — Kafka, Zookeeper, PostgreSQL, Redis, and the backend API — is fully containerized.

### 1. Start all services

```bash
docker compose up -d --build
```

Services started by Compose: `zookeeper`, `kafka`, `postgres`, `redis`, `backend`.

### 2. Seed the database

```bash
docker compose exec -w /app/backend backend python seed.py
```

### 3. Build product embeddings

```bash
docker compose exec -w /app/backend backend python -c "from backend.embedding import build_embeddings; build_embeddings()"
```

---

## Environment Variables

### Frontend (Vercel)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL. Do not include a trailing slash. | `https://techco-backend.onrender.com` |

If `VITE_API_BASE_URL` is not set in a production build, the app throws an explicit error at startup rather than silently failing.

Source: `src/lib/api-config.ts`

### Backend (Render / Production)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+psycopg2://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/0` |
| `FRONT_ORIGINS` | Comma-separated list of allowed CORS origins | `https://your-app.vercel.app,http://localhost:5173` |
| `ENABLE_KAFKA` | Set to `true` to activate Kafka producer/consumer | `false` |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka broker address | `kafka:9092` |

CORS configuration is logged at startup: `CORS allowed origins: [...]`.
To troubleshoot CORS errors, verify that `FRONT_ORIGINS` includes the exact Vercel deployment URL.

See `backend/.env.example` for a full list of variables with descriptions.

---

## API Reference

### Orders API (Kafka Event Producer)

Creates an order, persists it to PostgreSQL, and publishes `ORDER_CREATED` to the `order.events` Kafka topic.

```
POST /api/orders/
```

```bash
curl -X POST http://localhost:8000/api/orders/ \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "items": [{"productId": 101, "qty": 2, "price": 199.0}]}'
```

Response:

```json
{
  "id": 2,
  "orderNo": "ORD-DCF19CEAF4CE",
  "userId": 1,
  "status": "CREATED",
  "totalAmount": 398.0,
  "items": [{"productId": 101, "qty": 2, "price": 199.0}],
  "metadata": {},
  "createdAt": "2026-01-07T12:32:20.021742",
  "updatedAt": "2026-01-07T12:32:20.021744"
}
```

### User Interaction Ingress (ML Pipeline Feed)

Captures user activity (view, click, buy) and writes to Redis user history. Optionally forwards to Kafka when enabled.

```
POST /api/ai/feedback
```

```bash
curl -X POST http://localhost:8000/api/ai/feedback \
  -H "Content-Type: application/json" \
  -d '{"userId": "u123", "orderId": "o456", "action": "view_details"}'
```

Interactions are appended to `/data/interactions.json` as a fallback when the primary logging service is unavailable.

### Hybrid Recommendation Engine

Returns semantically similar products re-ranked by the requesting user's click history.

```
POST /api/recommend/hybrid
```

```bash
curl -X POST http://localhost:8000/api/recommend/hybrid \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "k": 4}'
```

Response:

```json
{
  "recommendations": [
    {
      "id": 1,
      "name": "AlphaPhone X",
      "price": 999.0,
      "image": "https://picsum.photos/seed/1/400/500",
      "why": "유사 상품",
      "why_en": "Similar products",
      "confidence": 1.0
    },
    {
      "id": 12,
      "name": "EdgeAI Dev Board",
      "price": 149.0,
      "why": "최근 관심 반영",
      "why_en": "Reflecting recent interest",
      "confidence": 0.381
    }
  ]
}
```

---

## Event Pipeline Verification

To verify that the backend is producing messages to the Kafka broker, run the console consumer inside the Kafka container after posting an order:

```bash
docker exec -it <kafka_container_name> kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic order.events \
  --from-beginning \
  --property print.key=true \
  --property print.value=true
```

---

## License

MIT License
