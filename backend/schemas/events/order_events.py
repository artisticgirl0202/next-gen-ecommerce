from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime

class OrderItemEvent(BaseModel):
    productId: int
    qty: int
    price: float

class OrderCreatedEvent(BaseModel):
    type: Literal["order.created"]
    orderId: int
    orderNo: str
    user_id: int
    totalAmount: float
    items: List[OrderItemEvent]
    timestamp: datetime
