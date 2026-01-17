import json
import psycopg2
from psycopg2.extras import Json
import os
import time
from dotenv import load_dotenv

# 1. 환경 변수 로드
load_dotenv()

# 2. 설정: 여기에 정확한 파일 경로를 지정했습니다.
# (Windows 경로이므로 앞에 r을 붙여 raw string으로 처리)
TARGET_JSON_PATH = r"E:\websiteportfolio\next-gen-ecommerce\next-gen-ecommerce\backend\data\products.json"

def get_db_connection():
    max_retries = 5
    db_url = os.environ.get("DATABASE_URL")

    if not db_url:
        print("❌ DATABASE_URL 환경 변수가 없습니다. .env 파일을 확인하세요.")
        raise Exception("Missing DATABASE_URL")

    # Render 등 클라우드 DB 연결을 위한 SSL 모드 강제 설정
    if "sslmode" not in db_url:
        if "?" in db_url:
            db_url += "&sslmode=require"
        else:
            db_url += "?sslmode=require"

    print(f"📡 Render DB 연결 시도 중... (URL 확인 완료)")

    for i in range(max_retries):
        try:
            conn = psycopg2.connect(db_url)
            return conn
        except psycopg2.OperationalError as e:
            print(f"⚠️ 연결 실패, 재시도 중... ({i+1}/{max_retries}) - {e}")
            time.sleep(3)

    raise Exception("❌ DB 연결 실패! 네트워크 상태나 방화벽을 확인하세요.")

# --- 메인 로직 ---
try:
    # 1. DB 연결
    conn = get_db_connection()
    cur = conn.cursor()
    print("✅ DB 연결 성공!")

    # 2. 테이블 초기화 (DROP & CREATE)
    print("🗑️ 기존 테이블 삭제 중...")
    cur.execute("DROP TABLE IF EXISTS products;")
    conn.commit()

    print("🛠️ 새 테이블 생성 중...")
    # specs와 reviews는 JSONB 타입으로 유연하게 저장
    cur.execute("""
        CREATE TABLE products (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            brand TEXT,
            category TEXT,
            description TEXT,
            price DOUBLE PRECISION,
            image TEXT,  
            specs JSONB,
            reviews JSONB
        );
    """)
    conn.commit()
    print("✅ 'products' 테이블 생성 완료.")

except Exception as e:
    print(f"❌ 초기 DB 설정 에러: {e}")
    if 'conn' in locals() and conn: conn.close()
    exit()

# 3. JSON 파일 읽기 (경로 우선순위 적용)
products = None

# 사용자가 지정한 경로를 최우선으로 확인
check_paths = [
    TARGET_JSON_PATH,
    os.path.join(os.path.dirname(__file__), 'data', 'products.json'),
    './data/products.json'
]

for path in check_paths:
    print(f"🔍 파일 찾는 중: {path}")
    if os.path.exists(path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                products = json.load(f)
                print(f"📂 파일 로드 성공! ({path})")
                break
        except Exception as e:
            print(f"⚠️ 파일은 찾았으나 읽기 실패: {e}")
    else:
        print("   -> 파일 없음")

if products is None:
    print(f"❌ 오류: 다음 경로들에서 products.json을 찾을 수 없습니다.\n{check_paths}")
    if 'conn' in locals() and conn: conn.close()
    exit()

# 4. 데이터 삽입
try:
    print(f"🚀 {len(products)}개 데이터 삽입 시작...")

    success_count = 0
    for p in products:
        try:
            cur.execute(
                """
                INSERT INTO products (id, name, brand, category, description, price, image, specs, reviews)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
                """,
                (
                    str(p.get('id')), # ID는 문자열로 변환하여 저장
                    p.get('name'),
                    p.get('brand', 'Generic'),
                    p.get('category'),
                    p.get('description'),
                    p.get('price'),
                    p.get('image'),
                    Json(p.get('specs', {})),   # 딕셔너리를 JSON으로 변환
                    Json(p.get('reviews', []))  # 리스트를 JSON으로 변환
                )
            )
            success_count += 1
        except Exception as insert_err:
            print(f"⚠️ 상품 ID {p.get('id')} 삽입 실패: {insert_err}")

    conn.commit()
    print(f"🎉 작업 완료! 총 {success_count}개의 상품이 Render DB에 저장되었습니다.")

except Exception as e:
    conn.rollback()
    print(f"❌ 데이터 삽입 중 치명적 에러: {e}")

finally:
    if cur: cur.close()
    if conn: conn.close()
    print("🔌 DB 연결 종료")
