from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.db.deps import get_db

from backend.schemas.order import OrderCreate, OrderResponse
from backend.services.order_service import create_order
from backend.models.order import Order as OrderModel
from backend.models.user import User
from backend.routers.auth import get_current_user
from typing import List, Any, Union
from backend.services.kafka_events import publish_order_created

router = APIRouter(tags=["orders"])

# ---------------------------------------------------------
# 🛠 [Helper] 이미지 주입 (SQL 직접 조회 방식)
# ---------------------------------------------------------
def enrich_items_with_images(db: Session, items: List[Any]) -> List[Any]:
    if not items:
        return []

    enriched_items = []

    # 1. 아이템 리스트 정규화 (SQLAlchemy 객체 or Dict -> Dict)
    for item in items:
        if isinstance(item, dict):
            temp_dict = item.copy()
        elif hasattr(item, "__dict__"):
             # SQLAlchemy 모델 객체인 경우
            temp_dict = {c.name: getattr(item, c.name) for c in item.__table__.columns}
        else:
            temp_dict = dict(item)

        # 기본값 설정
        temp_dict.setdefault("title", "Unknown Product")
        temp_dict.setdefault("image", "")
        temp_dict.setdefault("price", 0.0)
        temp_dict.setdefault("qty", temp_dict.get("quantity", 1))

        enriched_items.append(temp_dict)

    # 2. DB 조회 및 보강
    for item in enriched_items:
        pid = item.get("product_id") or item.get("productId") or item.get("id")

        if pid:
            try:
                # pid가 숫자인지 문자인지 확인하여 안전하게 조회
                sql = text("SELECT name, image, price FROM products WHERE id = :pid")

                # 먼저 문자열로 시도
                result = db.execute(sql, {"pid": str(pid)}).fetchone()

                # 없으면 숫자로 변환해서 재시도 (int 컬럼일 경우 대비)
                if not result and str(pid).isdigit():
                    result = db.execute(sql, {"pid": int(pid)}).fetchone()

                if result:
                    item["title"] = result[0]  # name -> title
                    item["image"] = result[1] or ""
                    item["price"] = float(result[2]) if result[2] else 0.0

            except Exception as e:
                print(f"⚠️ 상품 정보 보강 중 오류 (ID: {pid}): {e}")

    return enriched_items

# ---------------------------------------------------------
# 🚀 API Routers
# ---------------------------------------------------------

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def api_create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),   # ← JWT 인증 필수
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="items required")

    # user_id는 항상 검증된 JWT 토큰에서 추출 — 클라이언트 body의 userId는 무시
    order = create_order(db, payload, user_id=current_user.id)

    try:
        await publish_order_created(order)
    except Exception:
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
        metadata={},
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
        # ⬇️ [수정됨] 여기가 에러의 주범이었습니다. 빈 딕셔너리로 수정!
        metadata={},
        createdAt=order.created_at.isoformat(),
        updatedAt=order.updated_at.isoformat() if order.updated_at else order.created_at.isoformat(),
    )

@router.get("/user/{user_id}", response_model=List[OrderResponse])
def api_get_user_orders(user_id: Union[int, str], db: Session = Depends(get_db)):
    # DB에 저장된 타입에 맞춰 필터링
    query_id = int(user_id) if str(user_id).isdigit() else user_id

    orders = db.query(OrderModel)\
               .filter(OrderModel.user_id == query_id)\
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
                # ⬇️ [수정됨] 안전하게 빈 딕셔너리 처리
                metadata={},
                createdAt=order.created_at.isoformat(),
                updatedAt=order.updated_at.isoformat() if order.updated_at else order.created_at.isoformat(),
            )
        )
    return results
