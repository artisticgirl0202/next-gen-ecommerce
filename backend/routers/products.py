from fastapi import APIRouter, Query
from typing import Any
from pathlib import Path
import json

router = APIRouter()

ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "src" / "data" / "demo_products_500.json"

# 서버 시작 시 메모리에 한 번만 로드 (I/O 부하 최소화)
_ALL_PRODUCTS = []
if DATA_PATH.exists():
    with DATA_PATH.open("r", encoding="utf-8") as f:
        _ALL_PRODUCTS = json.load(f)

@router.get("/", summary="List demo products (paginated)")
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=200),
    q: str | None = Query(None)
) -> dict[str, Any]:
    items = _ALL_PRODUCTS

    # 검색어 필터링
    if q:
        q_lower = q.strip().lower()
        items = [p for p in items if q_lower in (p.get("name") or "").lower() or q_lower in (p.get("brand") or "").lower()]

    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    page_items = items[start:end]

    return {
        "items": page_items,  # ProductList.tsx의 fetchProducts가 기대하는 필드
        "total": total,
        "page": page,
        "pageSize": page_size
    }
