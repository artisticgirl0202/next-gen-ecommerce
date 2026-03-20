from sqlalchemy import Column, String, Float, Text, JSON, Index
from backend.db import Base

class Product(Base):
    __tablename__ = "products"

    # seed.py에서 id를 문자열(TEXT)로 저장하므로 String 사용
    id = Column(String, primary_key=True, index=True)

    name = Column(String, index=True)
    brand = Column(String, index=True)
    category = Column(String, index=True)
    # price 도 범위 필터링(price_low/price_high 정렬)에 자주 쓰이므로 인덱스 추가
    price = Column(Float, index=True)

    image = Column(String)
    description = Column(Text)

    # 상세 스펙과 리뷰는 JSONB로 저장되어 고속 조회 가능
    specs = Column(JSON, default={})
    reviews = Column(JSON, default=[])

    # 복합 인덱스: category + price (카테고리별 가격 필터링 쿼리 최적화)
    __table_args__ = (
        Index("ix_products_category_price", "category", "price"),
    )

    def __repr__(self):
        return f"<Product(id={self.id}, name={self.name})>"
