# backend/routers/health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def root():
    return {"status": "ok", "service": "next-gen-ecommerce-backend"}

@router.get("/health")
def health():
    return {"status": "ok", "model": "hybrid-recommender", "ready": True}

