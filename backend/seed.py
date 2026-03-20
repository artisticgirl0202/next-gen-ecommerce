import json
import psycopg2
from psycopg2.extras import Json
import os
import time
from dotenv import load_dotenv

# 환경 변수 로드 (컨테이너 내부에서는 이미 OS 레벨로 주입되어 있으므로 override=False)
load_dotenv(override=False)

# JSON 데이터 파일 경로 — 절대경로 대신 스크립트 기준 상대경로 사용
# (로컬 Windows 절대경로를 하드코딩하면 Docker 컨테이너 안에서 파일을 찾지 못함)
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
TARGET_JSON_PATH = os.path.join(_THIS_DIR, "data", "products.json")


def get_db_connection():
    db_url = os.environ.get("DATABASE_URL")

    if not db_url:
        print("❌ DATABASE_URL 환경 변수가 없습니다.")
        raise Exception("Missing DATABASE_URL")

    # postgres:// → psycopg2 가 인식하는 postgresql:// 로 정규화
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    # SQLAlchemy 드라이버 prefix 제거 (psycopg2 는 libpq DSN 형식만 수용)
    if db_url.startswith("postgresql+psycopg2://"):
        db_url = db_url.replace("postgresql+psycopg2://", "postgresql://", 1)

    # ─── SSL 처리 ──────────────────────────────────────────────────────
    # Neon / Render 같은 클라우드 DB → sslmode=require 필요
    # 로컬 Docker postgres       → SSL 미지원이므로 sslmode=disable 사용
    #
    # 판별 기준: DATABASE_URL 호스트가 "postgres" 이면 Docker 내부 서비스
    is_local_docker = "host=postgres" in db_url or "@postgres:" in db_url or "@postgres/" in db_url

    if "sslmode" not in db_url:
        if is_local_docker:
            # 로컬 Docker: SSL 비활성화
            sep = "&" if "?" in db_url else "?"
            db_url += f"{sep}sslmode=disable"
        else:
            # 클라우드: SSL 필수
            sep = "&" if "?" in db_url else "?"
            db_url += f"{sep}sslmode=require"

    target = "로컬 Docker postgres" if is_local_docker else "클라우드 DB"
    print(f"📡 {target} 연결 시도 중...")

    max_retries = 5
    for i in range(max_retries):
        try:
            conn = psycopg2.connect(db_url)
            return conn
        except psycopg2.OperationalError as e:
            print(f"⚠️ 연결 실패, 재시도 중... ({i+1}/{max_retries}) - {e}")
            time.sleep(3)

    raise Exception("❌ DB 연결 실패! 네트워크 상태나 방화벽을 확인하세요.")


# ── 메인 로직 ─────────────────────────────────────────────────────────────────
try:
    conn = get_db_connection()
    cur = conn.cursor()
    print("✅ DB 연결 성공!")

    print("🗑️ 기존 테이블 삭제 중...")
    cur.execute("DROP TABLE IF EXISTS products;")
    conn.commit()

    print("🛠️ 새 테이블 생성 중...")
    cur.execute("""
        CREATE TABLE products (
            id      TEXT PRIMARY KEY,
            name    TEXT NOT NULL,
            brand   TEXT,
            category TEXT,
            description TEXT,
            price   DOUBLE PRECISION,
            image   TEXT,
            specs   JSONB,
            reviews JSONB
        );
    """)
    # 자주 사용되는 컬럼에 인덱스 생성
    cur.execute("CREATE INDEX IF NOT EXISTS ix_products_name     ON products (name);")
    cur.execute("CREATE INDEX IF NOT EXISTS ix_products_brand    ON products (brand);")
    cur.execute("CREATE INDEX IF NOT EXISTS ix_products_category ON products (category);")
    cur.execute("CREATE INDEX IF NOT EXISTS ix_products_price    ON products (price);")
    cur.execute("CREATE INDEX IF NOT EXISTS ix_products_cat_price ON products (category, price);")
    conn.commit()
    print("✅ 'products' 테이블 및 인덱스 생성 완료.")

except Exception as e:
    print(f"❌ 초기 DB 설정 에러: {e}")
    if "conn" in locals() and conn:
        conn.close()
    exit()


# ── JSON 파일 읽기 ──────────────────────────────────────────────────────────
products = None

check_paths = [
    TARGET_JSON_PATH,
    os.path.join(os.path.dirname(__file__), "data", "products.json"),
    "./data/products.json",
]

for path in check_paths:
    print(f"🔍 파일 찾는 중: {path}")
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                products = json.load(f)
            print(f"📂 파일 로드 성공! ({path})")
            break
        except Exception as e:
            print(f"⚠️ 파일은 찾았으나 읽기 실패: {e}")
    else:
        print("   -> 파일 없음")

if products is None:
    print(f"❌ 오류: products.json 을 찾을 수 없습니다.\n검색 경로: {check_paths}")
    if "conn" in locals() and conn:
        conn.close()
    exit()


# ── 데이터 삽입 ─────────────────────────────────────────────────────────────
try:
    print(f"🚀 {len(products)}개 데이터 삽입 시작...")
    success_count = 0

    for p in products:
        try:
            cur.execute(
                """
                INSERT INTO products
                    (id, name, brand, category, description, price, image, specs, reviews)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                (
                    str(p.get("id")),
                    p.get("name"),
                    p.get("brand", "Generic"),
                    p.get("category"),
                    p.get("description"),
                    p.get("price"),
                    p.get("image"),
                    Json(p.get("specs", {})),
                    Json(p.get("reviews", [])),
                ),
            )
            success_count += 1
        except Exception as insert_err:
            print(f"⚠️ 상품 ID {p.get('id')} 삽입 실패: {insert_err}")

    conn.commit()
    print(f"🎉 작업 완료! 총 {success_count}개의 상품이 저장되었습니다.")

except Exception as e:
    conn.rollback()
    print(f"❌ 데이터 삽입 중 치명적 에러: {e}")

finally:
    if "cur" in locals() and cur:
        cur.close()
    if "conn" in locals() and conn:
        conn.close()
    print("🔌 DB 연결 종료")
