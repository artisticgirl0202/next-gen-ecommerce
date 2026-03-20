import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# ── URL 로드 ──────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL")

# Render 등 일부 호스팅이 "postgres://" 로 제공하는 경우 수정
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)

# psycopg2 드라이버를 명시적으로 지정 (미지정 시 SQLAlchemy 가 자동으로 psycopg2 를 선택하지만 명시가 안전)
if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

# fallback: SQLite (로컬 테스트 전용)
if not DATABASE_URL:
    print("⚠️ DATABASE_URL 없음. 로컬 SQLite를 사용합니다.")
    DATABASE_URL = "sqlite:///./sql_app.db"

_is_sqlite = DATABASE_URL.startswith("sqlite")

# ── Engine ────────────────────────────────────────────────────────────────
# asyncpg 로 전환하려면:
#   1. requirements.txt 에 asyncpg 추가 (이미 추가됨)
#   2. DATABASE_URL 을 "postgresql+asyncpg://..." 로 변경
#   3. create_async_engine + AsyncSession 으로 교체
#   4. 모든 라우터 함수를 async def + await db.execute() 로 변경
#
# 현재는 psycopg2 동기 드라이버를 사용하되, Connection Pool 을 최적화합니다.

_pool_kwargs = {} if _is_sqlite else {
    # 상시 유지할 커넥션 수 (FastAPI worker 당 적절한 값)
    "pool_size": 5,
    # pool_size 초과 시 임시로 허용할 추가 커넥션 수
    "max_overflow": 10,
    # 빈 커넥션 대기 최대 시간 (초) — 초과 시 TimeoutError
    "pool_timeout": 30,
    # 오래된 커넥션을 주기적으로 교체 (30분, 단위: 초)
    "pool_recycle": 1800,
}

engine = create_engine(
    DATABASE_URL,
    future=True,
    # 쿼리 전 커넥션 생존 여부 확인 → 끊긴 커넥션 자동 재연결
    pool_pre_ping=True,
    **_pool_kwargs,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# ── Dependency ────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
