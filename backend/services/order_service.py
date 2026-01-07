# backend/services/order_service.py
# import logging
# from backend.models.order import Order, OrderStatus
# from backend.schemas.order import OrderCreate
# from sqlalchemy.orm import Session
# from backend.services.kafka_producer import send_user_event  # 기존 util
# from backend.services.cache import add_recent_order  # we'll add
# from decimal import Decimal
# import random
# from datetime import datetime

# logger = logging.getLogger(__name__)

# def generate_order_no(prefix="ORD"):
#     ts = datetime.utcnow().strftime("%Y%m%d%H%M%S")
#     rand = random.randint(1000, 9999)
#     return f"{prefix}-{ts}-{rand}"

# def calc_total(items):
#     total = Decimal("0")
#     for it in items:
#         price = Decimal(str(it.get("price") or 0))
#         total += price * int(it.get("qty", 1))
#     return float(total)

# def create_order(db: Session, payload: OrderCreate):
#     # 1. build order row
#     items = [item.model_dump() for item in payload.items]
#     total = calc_total([{"price": it.get("price"), "qty": it.get("qty")} for it in items])
#     order_no = generate_order_no()

#     order = Order(
#         order_no=order_no,
#         user_id=payload.userId,
#         status=OrderStatus.CREATED,
#         total_amount=total,
#         items=items,
#         metadata=payload.metadata or {}
#     )
#     db.add(order)
#     db.commit()
#     db.refresh(order)

#     # 2. Redis: store recent orders
#     try:
#         add_recent_order(str(order.user_id), order.order_no)
#     except Exception:
#         logger.exception("add_recent_order failed")

#     # 3. Kafka: publish event
#     try:
#         send_user_event({
#             "type": "order.created",
#             "order_id": order.id,
#             "order_no": order.order_no,
#             "user_id": order.user_id,
#             "total_amount": float(order.total_amount),
#             "items": order.items,
#             "timestamp": datetime.utcnow().isoformat(),
#         })
#     except Exception:
#         logger.exception("send_user_event failed")
#     return order
# backend/services/order_service.py
import uuid
import json
import logging
from pathlib import Path
from typing import Dict, Any
from sqlalchemy.orm import Session

from backend.schemas.order import OrderCreate
from backend.models.order import Order, OrderStatus
from fastapi import BackgroundTasks


logger = logging.getLogger(__name__)

# try to import existing send_event; fallback to no-op
try:
    from backend.services.kafka_producer import send_event
except Exception:
    def send_event(topic: str, event_type: str, payload: Dict[str, Any]):
        logger.info("kafka not available - stub send_event: %s %s", topic, event_type)

# fallback file (Kafka 실패 시)
FALLBACK_DIR = Path("/app/data")
FALLBACK_FILE = FALLBACK_DIR / "order_events.log"
FALLBACK_DIR.mkdir(parents=True, exist_ok=True)


def create_order(db: Session, payload: OrderCreate) -> Order:
    order_no = f"ORD-{uuid.uuid4().hex[:12].upper()}"

    items_serialized = []
    total_amount = 0.0

    for it in payload.items:
        price = float(it.price) if it.price is not None else 0.0
        qty = int(it.qty)
        total_amount += price * qty
        items_serialized.append({
            "productId": int(it.productId),
            "qty": qty,
            "price": price,
        })

    order = Order(
        order_no=order_no,
        user_id=int(payload.userId),
        status=OrderStatus.CREATED.value,
        total_amount=total_amount,
        items=items_serialized,
        metadata_json=payload.metadata,
    )

    try:
        db.add(order)
        db.commit()
        db.refresh(order)
    except Exception:
        db.rollback()
        logger.exception("Failed to persist order")
        raise

    event_payload = {
        "orderId": order.id,
        "orderNo": order.order_no,
        "userId": order.user_id,
        "items": items_serialized,
        "totalAmount": float(order.total_amount),
        "status": order.status.value if hasattr(order.status, "value") else str(order.status),
        "createdAt": order.created_at.isoformat(),
    }

    # publish Kafka event (non-fatal)
    try:
        send_event(
            topic="order.events",
            event_type="ORDER_CREATED",
            payload=event_payload,
        )
    except Exception:
        logger.exception("Failed to send order event, fallback to file")

        try:
            with FALLBACK_FILE.open("a", encoding="utf-8") as f:
                f.write(json.dumps({
                    "topic": "order.events",
                    "eventType": "ORDER_CREATED",
                    "payload": event_payload,
                }, ensure_ascii=False) + "\n")
        except Exception:
            logger.exception("Fallback file write also failed")

    return order
