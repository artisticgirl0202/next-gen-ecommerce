from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, JSON, Numeric
from backend.db import Base
import enum

class OrderStatus(enum.Enum):
    CREATED = "CREATED"
    PAID = "PAID"
    SHIPPED = "SHIPPED"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    order_no = Column(String(32), unique=True, index=True, nullable=False)
    user_id = Column(Integer, nullable=False, index=True)

    items = Column(JSON, nullable=False)

    metadata_json = Column("metadata", JSON, nullable=True)

    subtotal = Column(Numeric(12, 2))
    shipping_cost = Column(Numeric(12, 2))
    total_amount = Column(Numeric(12, 2))

    status = Column(String(32), default=OrderStatus.CREATED.value)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
