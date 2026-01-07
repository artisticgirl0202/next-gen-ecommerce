# Next-Gen E-Commerce — Project README

This repository contains a full-stack, event-driven e-commerce demo with an integrated hybrid recommender. Below are the core implemented features and **working evidence** (exact `curl` commands and outputs) you can run locally in the provided Docker environment.

---

## 1) Orders API (fully working)

Create an order (POST /api/orders):

```bash
curl -X POST http://localhost:8000/api/orders/ \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"items":[{"productId":101,"qty":2,"price":199.0}]}'
```

Response (server output shown exactly):

```json
{
  "id": 2,
  "orderNo": "ORD-DCF19CEAF4CE",
  "userId": 1,
  "status": "CREATED",
  "totalAmount": 398.0,
  "items": [{ "productId": 101, "qty": 2, "price": 199.0 }],
  "metadata": null,
  "createdAt": "2026-01-07T12:32:20.021742",
  "updatedAt": "2026-01-07T12:32:20.021744"
}
```

---

## 2) Event pipeline (Kafka)

Check topic messages using the console consumer inside the Kafka container:

```bash
kafka-console-consumer \
  --bootstrap-server kafka:9092 \
  --topic order.events \
  --from-beginning \
  --property print.key=true \
  --property print.value=true
```

Trigger an order POST (again) — example client command (unchanged):

```bash
curl -X POST http://localhost:8000/api/orders/\
-H "Content-Type: application/json" \
-d '{
"userId": 1,
"items": [
{ "productId": 999, "qty": 1, "price": 333.0 }
 ]
}'
```

Observed server/console example payload (preserved as provided):

```text
{"id": 23. "orderNo": "ORD-1DD92091A8F1" "userId": 1 "status": "CREATED" "totalAmount": 333.0. "items : ["productId": 999, "qty" :1, "price": 333.0}], "metadata": null, "createdAt": "2026-01-07714: 37:43.34
367", "'updatedAt":"2026-01-07T14:37:43.348370"}
```

> Note: the string above is included verbatim as requested. In practice, the Kafka console consumer will print the JSON payload produced by the Orders API. If you see malformed output, check producer serialization or consumer print options.

---

## 3) Consumer (simple ML pipeline ingress)

Frontend / AI-feedback endpoint stores interactions which become consumer input for ML pipelines.

```bash
curl -X POST http://localhost:8000/api/ai/feedback \
  -H "Content-Type: application/json" \
  -d '{"userId":"u123","orderId":"o456","action":"view_details"}'
```

Sample interactions (file /data/interactions.json lines, preserved):

```text
{"userId": "u123", "orderId": "o456", "action": "view_details", "ts": "2026-01-07T03:38:50.181240"}
{"userId": 123, "orderId": 456, "action": "view_details", "ts": "2026-01-07T04:19:54.744298"}
```

These records are ready for downstream processing (consumer picks up and feeds feature store / offline training / streaming model updates).

---

## 4) Recommender (FAISS-based + hybrid wrapper)

Hybrid recommendation endpoint (semantic + business signals):

```bash
curl -X POST http://localhost:8000/api/recommend/hybrid \
  -H "Content-Type: application/json" \
  -d '{"product_id": 1, "k": 4}'
```

Example response (preserved):

```json
{
  "recommendations":[
    {"id":1,"name":"AlphaPhone X","price":999.0,"image":"https://picsum.photos/seed/1/400/500","why":"콘텐츠 유사","confidence":1.0},
    {"id":12,"name":"EdgeAI Dev Board","price":149.0,"why":"콘텐츠 유사","confidence":0.381},
    ...
  ]
}
```

Notes:

- The hybrid wrapper combines semantic similarity (FAISS nearest neighbors on embeddings) with business rules (filters, scoring adjustments, heuristics) and returns `why` and `confidence` metadata for explainability.

---

## 5) Sentence Transformers (Embeddings)

**Key points (from `backend/embedding.py`)**:

- The code prefers `sentence_transformers` and uses the model **`sentence-transformers/all-MiniLM-L6-v2`** (a MiniLM-based Sentence-BERT variant) to compute product embeddings.

- If `sentence_transformers` is not available in the runtime, the code falls back to **TF-IDF + TruncatedSVD** (scikit-learn). If that is also unavailable, the final fallback is a simple **char-hash** vectorization. This multi-level fallback ensures **service continuity**.

- Embeddings are normalized (unit norm) to be compatible with cosine-similarity search and are saved to disk as `.npy` (cache) to avoid repeated expensive recomputation in Docker/server environments.

**Conclusion (production-readiness):**

- The repository is designed to use **Sentence-BERT (MiniLM)** for semantic embeddings and is resilient to environment issues. The model choice (MiniLM) is small/efficient and can run on CPU; this makes it realistic for deployment in Docker-based CPU-only servers.

- For actual use, ensure the Docker image / `requirements.txt` contains `sentence-transformers` and a compatible backend (e.g., `torch` or `transformers` runtime) so the model can be loaded. If not installed, the service will still operate using the TF-IDF fallback, keeping the API functional.

---

## How to use this repository (quick start)

1. Start services:

```bash
docker compose up -d --build
```

2. Test Orders API (see section 1 curl above).
3. Inside the Kafka container, run the console consumer to watch `order.events` (see section 2).
4. Post AI interactions to `/api/ai/feedback` to populate the interaction log (see section 3).
5. Call the hybrid recommender to see FAISS-based semantic results combined with heuristics (see section 4).

---

## Final notes

This README preserves the exact command examples and their outputs as recorded during implementation. Use these as starting evidence in your portfolio to demonstrate the integrated, event-driven recommender system that combines backend APIs, Kafka streaming, a consumer ML ingress, and a FAISS-based hybrid recommender using Sentence Transformers (with robust fallbacks).
