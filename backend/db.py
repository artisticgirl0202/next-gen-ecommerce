import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 환경변수 가져오기
DATABASE_URL = os.getenv("DATABASE_URL")

# [필수] Render 배포용 URL 수정 코드 (postgres:// -> postgresql://)
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 로컬 개발용 예외처리 (URL 없으면 SQLite 사용)
if not DATABASE_URL:
    print("⚠️ DATABASE_URL 없음. 로컬 SQLite(sql_app.db)를 사용합니다.")
    DATABASE_URL = "sqlite:///./sql_app.db"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    future=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
