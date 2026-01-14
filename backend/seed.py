import json
import psycopg2
from psycopg2.extras import Json
import os
import time

# 1. DB 연결 설정
def get_db_connection():
    max_retries = 5
    for i in range(max_retries):
        try:
            conn = psycopg2.connect(
                host="localhost",
                port=5432,
                database="appdb",
                user="app",
                password="strong-password"
            )
            return conn
        except psycopg2.OperationalError:
            print(f"DB 연결 시도 중... ({i+1}/{max_retries})")
            time.sleep(2)
    raise Exception("DB 연결 실패! 도커가 실행 중인지 확인하세요.")

try:
    conn = get_db_connection()
    cur = conn.cursor()
    print("DB 연결 성공!")

    # ---------------------------------------------------------
    # [핵심] 기존 테이블 무조건 삭제 (DROP)
    # 이 부분이 있어야 컬럼 이름이 'image_url'에서 'image'로 바뀝니다.
    # ---------------------------------------------------------
    print("구버전 테이블 삭제 중...")
    cur.execute("DROP TABLE IF EXISTS products;")
    conn.commit()

    # 2. 테이블 새로 생성 (image 컬럼으로 생성됨)
    print("새 테이블 생성 중...")
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
    print("✅ 'products' 테이블이 image 컬럼으로 재생성되었습니다.")

except Exception as e:
    print(f"초기 설정 에러: {e}")
    exit()

# 3. JSON 파일 경로 (경로 문제 방지를 위해 두 곳 다 확인)
possible_paths = [
    os.path.join(os.path.dirname(__file__), 'data/products.json'),
    os.path.join(os.path.dirname(__file__), '../src/data/demo_products_500.json')
]

products = None
for path in possible_paths:
    if os.path.exists(path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                products = json.load(f)
                print(f"파일 로드 성공: {path}")
                break
        except Exception as e:
            print(f"파일 읽기 실패 ({path}): {e}")

if products is None:
    print("❌ JSON 파일을 찾을 수 없습니다. 경로를 확인해주세요.")
    exit()

# 4. 데이터 삽입
try:
    print(f"{len(products)}개 데이터 삽입 시작...")

    for p in products:
        cur.execute(
            """
            INSERT INTO products (id, name, brand, category, description, price, image, specs, reviews)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
            """,
            (
                str(p.get('id')),
                p.get('name'),
                p.get('brand', 'Generic'),
                p.get('category'),
                p.get('description'),
                p.get('price'),
                p.get('image'),   # 이제 에러 안 남
                Json(p.get('specs', {})),
                Json(p.get('reviews', []))
            )
        )

    conn.commit()
    print(f"🎉 성공! {len(products)}개의 상품 데이터가 DB에 저장되었습니다.")

except Exception as e:
    conn.rollback()
    print(f"데이터 삽입 중 에러 발생: {e}")
finally:
    if cur: cur.close()
    if conn: conn.close()
