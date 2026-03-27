# backend/schemas/order.py
# from pydantic import BaseModel, Field
# from pydantic import ConfigDict
# from typing import List, Optional

# class OrderItem(BaseModel):
#     productId: int
#     qty: int = Field(..., gt=0)
#     price: Optional[float] = None

# class OrderItemCreate(BaseModel):
#     productId: int
#     qty: int = Field(..., gt=0)

# class OrderCreate(BaseModel):
#     model_config = ConfigDict(populate_by_name=True)
#     user_id: int
#     items: List[OrderItem]
#     metadata: Optional[dict] = None

# class OrderResponseItem(OrderItem):
#     pass

# class OrderItemResponse(BaseModel):
#     id: int
#     productId: int
#     qty: int

# class OrderResponse(BaseModel):
#     id: int
#     orderNo: str
#     userId: int
#     status: str
#     totalAmount: float
#     items: List[OrderResponseItem]
#     createdAt: str
#     updatedAt: str
#     total: float
# backend/schemas/order.py
from typing import List, Optional
from pydantic import BaseModel, Field

class OrderItem(BaseModel):
    productId: int
    qty: int = Field(..., gt=0)
    price: Optional[float] = None

class OrderCreate(BaseModel):
    # userId is intentionally optional here — the router overwrites it with
    # the value derived from the authenticated JWT token (get_current_user).
    # Accepting it from the body is kept for backward compatibility only;
    # the service layer ignores payload.userId entirely.
    userId: Optional[int] = None
    items: List[OrderItem]
    metadata: Optional[dict] = None

class OrderResponse(BaseModel):
    id: int
    orderNo: str
    userId: int
    status: str
    totalAmount: float
    items: List[OrderItem]
    metadata: Optional[dict] = None
    createdAt: str
    updatedAt: str

    # Pydantic V2: orm_mode was renamed to from_attributes
    model_config = {"from_attributes": True}
