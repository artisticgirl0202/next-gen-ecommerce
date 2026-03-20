// src/types/index.ts (없다면 생성, 있다면 수정)

// 기본 상품 타입
export interface Product {
  id: number;
  name: string; // or title
  title?: string;
  price: number;
  image: string;
  category?: string;
  brand?: string;
  // ... 기타 기존 필드
}

// 추천 상품 타입 (Product 상속 + AI 필드 추가)
export interface Recommendation extends Product {
  why?: string; // AI 추천 이유 (KO)
  why_en?: string; // AI 추천 이유 (EN)
  confidence?: number; // 신뢰도 점수 (ex: 0.85)
}
