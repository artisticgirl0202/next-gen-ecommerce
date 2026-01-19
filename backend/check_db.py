# backend/check_db.py
import os
import psycopg2
from dotenv import load_dotenv

# 1. .env 로드
load_dotenv()

# 2. DB 연결
try:
    db_url = os.environ.get("DATABASE_URL")
    # SSL 모드 추가 (Render DB용)
    if "sslmode" not in db_url:
        db_url += "?sslmode=require" if "?" not in db_url else "&sslmode=require"

    conn = psycopg2.connect(db_url)
    cur = conn.cursor()

    # 3. 데이터 개수 확인
    cur.execute("SELECT count(*) FROM products;")
    count = cur.fetchone()[0]

    print(f"✅ 현재 데이터베이스에 저장된 상품 개수: {count}개")

    # 4. 샘플 데이터 3개만 출력해보기
    print("\n--- 🔍 최신 상품 3개 미리보기 ---")
    cur.execute("SELECT id, name, category, price FROM products ORDER BY id DESC LIMIT 3;")
    rows = cur.fetchall()

    for row in rows:
        print(f"ID: {row[0]} | 이름: {row[1]} | 가격: ${row[3]}")

    cur.close()
    conn.close()

except Exception as e:
    print(f"❌ 확인 중 에러 발생: {e}")
