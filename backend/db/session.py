import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db.base import Base

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. "
        "Check backend/.env or deployment environment variables."
    )

engine = create_engine(
    DATABASE_URL,
    future=True,
    pool_pre_ping=True,   # 끊어진 커넥션 자동 감지
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
