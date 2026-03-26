from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, DateTime, Integer, SmallInteger, String
from sqlalchemy.orm import relationship

from backend.db import Base

if TYPE_CHECKING:
    # Used only by static type checkers (mypy / pyright).
    # NOT evaluated at runtime, so it never triggers SQLAlchemy's
    # annotation introspection and avoids the Mapped[] conflict.
    from backend.models.order import Order  # noqa: F401


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # None for OAuth-only accounts
    full_name = Column(String(255), nullable=False)
    is_oauth = Column(Boolean, default=False, nullable=False)

    # Email verification
    is_verified = Column(Boolean, default=False, nullable=False)
    verification_token = Column(String(255), nullable=True, index=True)

    # Soft-delete / deactivation
    is_active = Column(Boolean, default=True, nullable=False)

    # Brute-force defense fields
    failed_login_attempts = Column(SmallInteger, default=0, nullable=False)
    account_locked_until = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # ── Relationships ──────────────────────────────────────────────────────
    # Do NOT add a class-level type annotation (e.g. List["Order"]) here.
    # This model uses the legacy Column() declarative style.  Mixing it with
    # Mapped[] annotations causes SQLAlchemy 2.0 to misinterpret the class as
    # an Annotated Declarative Table and raise ArgumentError.
    orders = relationship(
        "Order",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email={self.email})>"
