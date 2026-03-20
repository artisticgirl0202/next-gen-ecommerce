# backend/schemas/recommend.py
from pydantic import BaseModel
from typing import List, Optional

class RecommendRequest(BaseModel):
    product_id: int
    user_id: Optional[int] = None
    top_n: int = 6
    alpha: Optional[float] = None
    beta: Optional[float] = None

class ProductOut(BaseModel):
    id: int
    name: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    why: Optional[str] = None  # Korean explanation (XAI)
    why_en: Optional[str] = None  # English explanation (XAI)
    confidence: Optional[float] = None

class RecommendResponse(BaseModel):
    recommendations: List[ProductOut]
