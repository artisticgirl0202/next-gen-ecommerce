import os
import json
import psycopg2
from psycopg2.extras import execute_values

# 1. 설정 (환경변수에서 URL 가져오기)
DB_URL = os.getenv("DATABASE_URL")
JSON_PATH = "data/products.json"

def seed():
    if not DB_URL:
        print("❌ DATABASE_URL이 설정되지 않았습니다.")
        return

    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()

        # 2. 기존 데이터 삭제 (깔끔하게 시작)
        print("🗑️ 기존 상품 삭제 중...")
        cur.execute("TRUNCATE TABLE products CASCADE;")

        # 3. JSON 데이터 로드
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            products = json.load(f)

        # 4. 삽입할 데이터 가공
        data_list = []
        for p in products:
            data_list.append((
                str(p.get('id')),
                p.get('name'),
                p.get('brand', 'Generic'),
                p.get('category'),
                p.get('description'),
                float(p.get('price', 0)),
                p.get('image'),
                json.dumps(p.get('specs', {})),
                json.dumps(p.get('reviews', []))
            ))

        # 5. Bulk Insert 실행 (한꺼번에 삽입)
        print(f"🚀 {len(data_list)}개 데이터 삽입 시작...")
        query = """
            INSERT INTO products (id, name, brand, category, description, price, image, specs, reviews)
            VALUES %s
        """
        execute_values(cur, query, data_list)

        conn.commit()
        print("🎉 대성공! Render DB에 모든 데이터가 저장되었습니다.")

    except Exception as e:
        print(f"❌ 에러 발생: {e}")
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

if __name__ == "__main__":
    seed()
