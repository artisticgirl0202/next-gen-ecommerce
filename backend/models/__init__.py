"""
Explicitly import every SQLAlchemy model so that Base.metadata knows about
all tables before create_all() is called.

Without this file Python treats backend/models/ as a namespace package and
individual model files may not be executed during the import phase, causing
their tables to be silently skipped by create_all().

Import order matters: models that are referenced by ForeignKey must be
imported before (or at least alongside) the models that define the FK.
"""
from backend.models.user import User          # noqa: F401  → users
from backend.models.order import Order        # noqa: F401  → orders
from backend.models.refund import Refund      # noqa: F401  → refunds
from backend.models.product import Product    # noqa: F401  → products

__all__ = ["User", "Order", "Refund", "Product"]
