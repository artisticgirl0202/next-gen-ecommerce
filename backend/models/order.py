import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, Numeric, String
from sqlalchemy.orm import relationship

from backend.db import Base

if TYPE_CHECKING:
    from backend.models.user import User      # noqa: F401
    from backend.models.refund import Refund  # noqa: F401


class OrderStatus(enum.Enum):
    CREATED   = "CREATED"
    PAID      = "PAID"
    SHIPPED   = "SHIPPED"
    COMPLETED = "COMPLETED"
    CANCELED  = "CANCELED"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    order_no = Column(String(32), unique=True, index=True, nullable=False)

    # ── FK → users.id ─────────────────────────────────────────────────────
    # ondelete="SET NULL" keeps the order row even if the user is hard-deleted.
    # For soft-deletes (is_active=False) the row stays and the FK remains valid.
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,   # nullable so historical orders survive account deletion
        index=True,
    )

    items = Column(JSON, nullable=False)

    metadata_json = Column("metadata", JSON, nullable=True)

    subtotal      = Column(Numeric(12, 2))
    shipping_cost = Column(Numeric(12, 2))
    total_amount  = Column(Numeric(12, 2))

    status = Column(String(32), default=OrderStatus.CREATED.value, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    # ── Relationships ──────────────────────────────────────────────────────
    # No class-level type annotations — see user.py for the detailed reason.
    user = relationship(
        "User",
        back_populates="orders",
    )

    refunds = relationship(
        "Refund",
        back_populates="order",
        cascade="all, delete-orphan",
        lazy="select",
    )
