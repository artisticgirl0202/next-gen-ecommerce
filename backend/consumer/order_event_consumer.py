# import json
# from kafka import KafkaConsumer
# from sqlalchemy.orm import Session

# from backend.db.session import SessionLocal
# from backend.models.order_event import OrderEvent

# consumer = KafkaConsumer(
#     "order.events",
#     bootstrap_servers="kafka:9092",
#     value_deserializer=lambda m: json.loads(m.decode("utf-8")),
#     group_id="order-event-consumers",
#     auto_offset_reset="earliest",
# )

# def consume():
#     for msg in consumer:
#         data = msg.value
#         payload = data["payload"]

#         db: Session = SessionLocal()
#         try:
#             event = OrderEvent(
#                 order_id=payload["orderId"],
#                 event_type=data["type"],
#                 payload=payload,
#             )
#             db.add(event)
#             db.commit()
#         except Exception:
#             db.rollback()
#             raise
#         finally:
#             db.close()

# if __name__ == "__main__":
#     consume()
# backend/consumer/order_event_consumer.py
import os, json, logging, time
logger = logging.getLogger("order_consumer")
logging.basicConfig(level=logging.INFO)

try:
    from confluent_kafka import Consumer
except Exception:
    Consumer = None
    logger.warning("confluent_kafka not installed; consumer will not run")

KAFKA = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
OUT = os.getenv("ORDER_EVENTS_FILE", "/data/order_events.jsonl")
GROUP = "order_event_consumer_v1"

def run():
    if Consumer is None:
        logger.error("confluent-kafka missing")
        return
    conf = {"bootstrap.servers": KAFKA, "group.id": GROUP, "auto.offset.reset": "earliest"}
    c = Consumer(conf)
    c.subscribe(["order.events"])
    logger.info("consumer started")
    try:
        while True:
            msg = c.poll(1.0)
            if msg is None: continue
            if msg.error():
                logger.error("kafka error: %s", msg.error())
                continue
            try:
                obj = json.loads(msg.value().decode("utf-8"))
            except Exception:
                logger.exception("decode failed")
                continue
            with open(OUT, "a", encoding="utf-8") as f:
                f.write(json.dumps(obj, ensure_ascii=False) + "\n")
            logger.info("saved order event orderId=%s", obj.get("orderId"))
            # TODO: call reindex or update user history here (e.g., call recommendation service)
    except KeyboardInterrupt:
        logger.info("shutting")
    finally:
        c.close()

if __name__ == "__main__":
    run()
