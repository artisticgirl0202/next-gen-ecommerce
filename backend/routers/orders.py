
# backend/routers/orders.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.schemas.order import OrderCreate, OrderResponse
from backend.services.order_service import create_order
from backend.models.order import Order as OrderModel

import asyncio
from backend.services.kafka_events import publish_order_created

router = APIRouter(tags=["orders"])

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def api_create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="items required")

    order = create_order(db, payload)

    # 🔥 Kafka는 "있으면 보내고 끝"
    try:
        asyncio.create_task(publish_order_created(order))
    except RuntimeError:
        # event loop 없으면 그냥 무시
        pass

    return OrderResponse(
        id=order.id,
        orderNo=order.order_no,
        userId=order.user_id,
        status=str(order.status),
        totalAmount=float(order.total_amount),
        items=order.items,
        metadata=getattr(order, "metadata_json", None),
        createdAt=order.created_at.isoformat(),
        updatedAt=order.updated_at.isoformat() if order.updated_at else order.created_at.isoformat(),
    )

@router.get("/{order_id}", response_model=OrderResponse)
def api_get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="order not found")
    return OrderResponse(
        id=order.id,
        orderNo=order.order_no,
        userId=order.user_id,
        status=order.status.value if hasattr(order.status, "value") else str(order.status),
        totalAmount=float(order.total_amount),
        items=order.items,
        metadata=getattr(order, "metadata", None),
        createdAt=order.created_at.isoformat(),
        updatedAt=order.updated_at.isoformat() if order.updated_at else order.created_at.isoformat(),
    )
