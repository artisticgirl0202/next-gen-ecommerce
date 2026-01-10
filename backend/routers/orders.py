
# backend/routers/orders.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.db import get_db
from backend.schemas.order import OrderCreate, OrderResponse
from backend.services.order_service import create_order
from backend.models.order import Order as OrderModel
from typing import List
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
@router.get("/user/{user_id}", response_model=List[OrderResponse])
def api_get_user_orders(user_id: int, db: Session = Depends(get_db)):
    # 해당 user_id를 가진 주문들을 찾아서, 최신순(내림차순)으로 정렬
    orders = db.query(OrderModel)\
               .filter(OrderModel.user_id == user_id)\
               .order_by(OrderModel.created_at.desc())\
               .all()

    # DB 모델 -> Pydantic 스키마(OrderResponse)로 변환하여 리스트 반환
    return [
        OrderResponse(
            id=order.id,
            orderNo=order.order_no,
            userId=order.user_id,
            # Enum 처리 안전하게 문자열로 변환
            status=order.status.value if hasattr(order.status, "value") else str(order.status),
            totalAmount=float(order.total_amount),
            items=order.items,
            metadata=getattr(order, "metadata_json", None), # 혹은 "metadata" (모델 필드명 확인 필요)
            createdAt=order.created_at.isoformat(),
            updatedAt=order.updated_at.isoformat() if order.updated_at else order.created_at.isoformat(),
        )
        for order in orders
    ]
