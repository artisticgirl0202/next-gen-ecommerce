import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 환경변수 가져오기
DATABASE_URL = os.getenv("DATABASE_URL")

# [필수] Render 배포용 URL 수정 코드
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not DATABASE_URL:
    print("⚠️ DATABASE_URL 없음. 로컬 SQLite를 사용합니다.")
    DATABASE_URL = "sqlite:///./sql_app.db"

engine = create_engine(
    DATABASE_URL,
    future=True,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# get_db 함수가 여기에도 있을 수 있습니다.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
