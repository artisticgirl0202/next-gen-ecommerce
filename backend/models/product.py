from sqlalchemy import Column, String, Float, Text, JSON
from backend.db import Base

class Product(Base):
    __tablename__ = "products"

    # seed.py에서 id를 문자열(TEXT)로 저장하므로 String 사용
    id = Column(String, primary_key=True, index=True)

    name = Column(String, index=True)
    brand = Column(String, index=True)  # JSON 데이터에 있는 brand 필드 추가
    category = Column(String, index=True)
    price = Column(Float)

    # JSON의 'image' 키와 매핑
    image = Column(String)

    description = Column(Text)

    # 상세 스펙과 리뷰는 구조화된 데이터이므로 JSON 타입 사용
    # DB에서는 JSONB로 저장되어 고속 조회 가능
    specs = Column(JSON, default={})
    reviews = Column(JSON, default=[])

    # 객체를 출력할 때 보기 좋게 표현 (디버깅용)
    def __repr__(self):
        return f"<Product(id={self.id}, name={self.name})>"
