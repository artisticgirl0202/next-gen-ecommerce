from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.db.deps import get_db

from backend.schemas.order import OrderCreate, OrderResponse
from backend.services.order_service import create_order
from backend.models.order import Order as OrderModel
from typing import List, Any
import asyncio
from backend.services.kafka_events import publish_order_created

router = APIRouter(tags=["orders"])

# ---------------------------------------------------------
# 🛠 [Helper] 이미지 주입 (SQL 직접 조회 방식 - 모델 없이 안전함)
# ---------------------------------------------------------
def enrich_items_with_images(db: Session, items: List[Any]) -> List[Any]:
    if not items:
        return []

    enriched_items = []
    for item in items:
        # SQLAlchemy 객체인 경우 dict로 변환
        if hasattr(item, "__dict__"):
            temp_dict = {c.name: getattr(item, c.name) for c in item.__table__.columns}
        elif isinstance(item, dict):
            temp_dict = item.copy()
        else:
            temp_dict = dict(item)
        enriched_items.append(temp_dict)

    for item in enriched_items:
        # 1. 프론트엔드 호환성을 위해 키 값 정규화
        pid = item.get("product_id") or item.get("productId") or item.get("id")

        if pid:
            try:
                # 💡 이미지 뿐만 아니라 이름(name)과 가격(price)도 함께 조회하여 보강
                result = db.execute(
                    text("SELECT name, image, price FROM products WHERE id = :pid"),
                    {"pid": str(pid)}
                ).fetchone()

                if result:
                    # 프론트엔드 OrderItemView 인터페이스에 맞춰 데이터 매핑
                    item["id"] = pid
                    item["title"] = result[0]  # name -> title
                    item["image"] = result[1] or ""
                    item["price"] = float(result[2]) if result[2] else 0
                    # 만약 item에 qty가 없고 quantity만 있다면
                    item["qty"] = item.get("quantity") or item.get("qty") or 1

            except Exception as e:
                print(f"상품 정보 보강 중 오류: {e}")

    return enriched_items

# ---------------------------------------------------------
# 🚀 API Routers
# ---------------------------------------------------------

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def api_create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="items required")

    order = create_order(db, payload)

    try:
        asyncio.create_task(publish_order_created(order))
    except RuntimeError:
        pass

    # 생성 시에도 이미지 보강
    final_items = enrich_items_with_images(db, order.items)

    return OrderResponse(
        id=order.id,
        orderNo=order.order_no,
        userId=order.user_id,
        status=str(order.status.value if hasattr(order.status, "value") else order.status),
        totalAmount=float(order.total_amount),
        items=final_items,
        metadata=getattr(order, "metadata_json", None),
        createdAt=order.created_at.isoformat(),
        updatedAt=order.updated_at.isoformat() if order.updated_at else order.created_at.isoformat(),
    )

@router.get("/{order_identifier}", response_model=OrderResponse)
def api_get_order(order_identifier: str, db: Session = Depends(get_db)):
    # 1. order_no로 조회
    order = db.query(OrderModel).filter(OrderModel.order_no == order_identifier).first()

    # 2. 없으면 ID(PK)로 조회
    if not order and order_identifier.isdigit():
        order = db.query(OrderModel).filter(OrderModel.id == int(order_identifier)).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # 🔥 이미지 보강 작업
    final_items = enrich_items_with_images(db, order.items)

    return OrderResponse(
        id=order.id,
        orderNo=order.order_no,
        userId=order.user_id,
        status=order.status.value if hasattr(order.status, "value") else str(order.status),
        totalAmount=float(order.total_amount),
        items=final_items,
        metadata=getattr(order, "metadata_json", getattr(order, "metadata", None)),
        createdAt=order.created_at.isoformat(),
        updatedAt=order.updated_at.isoformat() if order.updated_at else order.created_at.isoformat(),
    )

@router.get("/user/{user_id}", response_model=List[OrderResponse])
def api_get_user_orders(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(OrderModel)\
               .filter(OrderModel.user_id == user_id)\
               .order_by(OrderModel.created_at.desc())\
               .all()

    results = []
    for order in orders:
        final_items = enrich_items_with_images(db, order.items)
        results.append(
            OrderResponse(
                id=order.id,
                orderNo=order.order_no,
                userId=order.user_id,
                status=order.status.value if hasattr(order.status, "value") else str(order.status),
                totalAmount=float(order.total_amount),
                items=final_items,
                metadata=getattr(order, "metadata_json", None),
                createdAt=order.created_at.isoformat(),
                updatedAt=order.updated_at.isoformat() if order.updated_at else order.created_at.isoformat(),
            )
        )
    return results
