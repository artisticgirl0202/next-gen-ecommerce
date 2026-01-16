import json
import psycopg2
from psycopg2.extras import Json
import os
import time
from dotenv import load_dotenv
load_dotenv()
# 1. DB 연결 설정 (수정됨: 환경 변수 우선 사용)
def get_db_connection():
    max_retries = 5

    # 이제 괄호 안에 기본값이 없습니다!
    # 무조건 환경 변수(.env 혹은 Render 설정)에서 값을 가져옵니다.
    db_host = os.environ.get("POSTGRES_HOST")
    db_port = os.environ.get("POSTGRES_PORT")
    db_name = os.environ.get("POSTGRES_DB")
    db_user = os.environ.get("POSTGRES_USER")
    db_password = os.environ.get("POSTGRES_PASSWORD")

    # 값이 하나라도 없으면 에러를 띄웁니다 (안전장치)
    if not all([db_host, db_port, db_name, db_user, db_password]):
        print("❌ 환경 변수가 부족합니다. .env 파일을 확인하거나 Render 설정을 확인하세요.")
        # 로컬 개발 편의를 위해 여기서 하드코딩된 값을 '임시로' 리턴하지 말고,
        # 꼭 .env를 사용하도록 강제하는 것이 좋은 습관입니다.
        raise Exception("Missing Environment Variables")


    print(f"📡 DB 연결 시도: {db_user}@{db_host}:{db_port}/{db_name}")

    for i in range(max_retries):
        try:
            conn = psycopg2.connect(
                host=db_host,
                port=db_port,
                database=db_name,
                user=db_user,
                password=db_password
            )
            return conn
        except psycopg2.OperationalError as e:
            print(f"⚠️ 연결 실패, 재시도 중... ({i+1}/{max_retries})")
            time.sleep(2)

    raise Exception("❌ DB 연결 실패! 도커 네트워크 설정을 확인하세요.")

# 메인 로직 시작
try:
    conn = get_db_connection()
    cur = conn.cursor()
    print("✅ DB 연결 성공!")

    # ---------------------------------------------------------
    # [핵심] 기존 테이블 무조건 삭제 (DROP)
    # 이 부분이 있어야 컬럼 이름이 'image_url'에서 'image'로 바뀝니다.
    # ---------------------------------------------------------
    print("🗑️ 구버전 테이블 삭제 중...")
    cur.execute("DROP TABLE IF EXISTS products;")
    conn.commit()

    # 2. 테이블 새로 생성 (image 컬럼으로 생성됨)
    print("🛠️ 새 테이블 생성 중...")
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
    print(f"❌ 초기 설정 에러: {e}")
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
                print(f"📂 파일 로드 성공: {path}")
                break
        except Exception as e:
            print(f"⚠️ 파일 읽기 실패 ({path}): {e}")

if products is None:
    print("❌ JSON 파일을 찾을 수 없습니다. 경로를 확인해주세요.")
    exit()

# 4. 데이터 삽입
try:
    print(f"🚀 {len(products)}개 데이터 삽입 시작...")

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
    print(f"🎉 대성공! {len(products)}개의 상품 데이터가 DB에 저장되었습니다.")

except Exception as e:
    conn.rollback()
    print(f"❌ 데이터 삽입 중 에러 발생: {e}")
finally:
    if cur: cur.close()
    if conn: conn.close()
