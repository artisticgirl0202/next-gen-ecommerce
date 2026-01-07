# backend/services/kafka_events.py
import os
import logging
from backend.schemas.events.order_events import OrderCreatedEvent
from backend.services.kafka_producer import produce

logger = logging.getLogger(__name__)
ENABLE_KAFKA = os.getenv("ENABLE_KAFKA", "false").lower() == "true"

async def publish_order_created(order):
    if not ENABLE_KAFKA:
        return

    try:
        event = OrderCreatedEvent(
            type="order.created",
            orderId=order.id,
            orderNo=order.order_no,
            userId=order.user_id,
            totalAmount=float(order.total_amount),
            items=order.items,
        )
        await produce("order.events", event.model_dump(mode="json"))
    except Exception as e:
        logger.warning("Kafka publish failed: %s", e)
