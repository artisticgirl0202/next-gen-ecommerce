# backend/services/order_service.py
import uuid
import json
import logging
from pathlib import Path
from typing import Dict, Any

from sqlalchemy.orm import Session

from backend.schemas.order import OrderCreate
from backend.models.order import Order, OrderStatus

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------
# Kafka producer import (safe)
# ---------------------------------------------------------------------
try:
    from backend.services.kafka_producer import send_user_event
except Exception:
    def send_user_event(event: Dict[str, Any], topic: str | None = None):
        logger.info(
            "kafka not available - stub send_user_event: topic=%s event=%s",
            topic,
            event,
        )

# ---------------------------------------------------------------------
# Fallback file (Kafka 실패 시)
# ---------------------------------------------------------------------
FALLBACK_DIR = Path("/app/data")
FALLBACK_FILE = FALLBACK_DIR / "order_events.log"
FALLBACK_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------
def create_order(db: Session, payload: OrderCreate) -> Order:
    order_no = f"ORD-{uuid.uuid4().hex[:12].upper()}"

    items_serialized: list[dict] = []
    total_amount = 0.0

    for it in payload.items:
        price = float(it.price) if it.price is not None else 0.0
        qty = int(it.qty)
        total_amount += price * qty
        items_serialized.append(
            {
                "productId": int(it.productId),
                "qty": qty,
                "price": price,
            }
        )

    order = Order(
        order_no=order_no,
        user_id=int(payload.userId),
        status=OrderStatus.CREATED.value,
        total_amount=total_amount,
        items=items_serialized,
        metadata_json=payload.metadata,
    )

    # -----------------------------------------------------------------
    # DB persist
    # -----------------------------------------------------------------
    try:
        db.add(order)
        db.commit()
        db.refresh(order)
    except Exception:
        db.rollback()
        logger.exception("Failed to persist order")
        raise

    # -----------------------------------------------------------------
    # Event payload
    # -----------------------------------------------------------------
    event_payload = {
        "eventType": "ORDER_CREATED",
        "orderId": order.id,
        "orderNo": order.order_no,
        "userId": order.user_id,
        "items": items_serialized,
        "totalAmount": float(order.total_amount),
        "status": order.status,
        "createdAt": order.created_at.isoformat(),
    }

    # -----------------------------------------------------------------
    # Publish Kafka event (non-fatal)
    # -----------------------------------------------------------------
    try:
        send_user_event(event_payload, topic="order.events")
    except Exception:
        logger.exception("Failed to send order event, fallback to file")

        try:
            with FALLBACK_FILE.open("a", encoding="utf-8") as f:
                f.write(
                    json.dumps(
                        {
                            "topic": "order.events",
                            "payload": event_payload,
                        },
                        ensure_ascii=False,
                    )
                    + "\n"
                )
        except Exception:
            logger.exception("Fallback file write also failed")

    return order
