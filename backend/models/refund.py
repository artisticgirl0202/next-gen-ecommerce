import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from backend.db import Base

if TYPE_CHECKING:
    from backend.models.order import Order


class RefundStatus(enum.Enum):
    PENDING   = "PENDING"
    APPROVED  = "APPROVED"
    REJECTED  = "REJECTED"
    COMPLETED = "COMPLETED"


class Refund(Base):
    __tablename__ = "refunds"

    id = Column(Integer, primary_key=True, index=True)

    # ── FK → orders.id ────────────────────────────────────────────────────
    # CASCADE DELETE: when an order is deleted its refund records are removed too.
    order_id = Column(
        Integer,
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Amount requested / approved for refund
    refund_amount = Column(Numeric(12, 2), nullable=False)

    reason = Column(Text, nullable=True)

    status = Column(
        String(32),
        default=RefundStatus.PENDING.value,
        nullable=False,
        index=True,
    )

    # Processor note (e.g. rejection reason or approval reference)
    note = Column(Text, nullable=True)

    requested_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    resolved_at  = Column(DateTime, nullable=True)

    # ── Relationship ───────────────────────────────────────────────────────
    # No class-level type annotation — see user.py for the detailed reason.
    order = relationship(
        "Order",
        back_populates="refunds",
    )

    def __repr__(self) -> str:
        return (
            f"<Refund(id={self.id}, order_id={self.order_id}, "
            f"amount={self.refund_amount}, status={self.status})>"
        )
