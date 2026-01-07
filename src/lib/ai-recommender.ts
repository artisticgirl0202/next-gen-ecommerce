// lib/ai-recommender.ts
import type { Product } from "@/types";

export const getAIRecommendations = (currentProduct: Product, allProducts: Product[]) => {
  // 간단한 벡터 유사도 시뮬레이션: 카테고리 일치도 + 가격대 유사도
  return allProducts
    .filter(p => p.id !== currentProduct.id)
    .map(p => {
      let score = 0;
      if (p.category === currentProduct.category) score += 0.5;
      if (Math.abs(p.price - currentProduct.price) < 500) score += 0.3;
      if (p.brand === currentProduct.brand) score += 0.2;
      return { ...p, aiScore: score };
    })
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 4);
};
