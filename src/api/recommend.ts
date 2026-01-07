// src/api/recommend.ts
// import type { Product } from "@/types";

// const API_BASE = (import.meta.env.VITE_API_BASE ?? "http://localhost:8000").replace(/\/$/, "");

// export type Recommendation = Product & {
//   why?: string;
//   confidence?: number;
// };

// export interface RecommendResponse {
//   recommendations: Recommendation[];
// }

// export async function postJSON(url: string, body: any, timeout = 10000) {
//   const controller = new AbortController();
//   const id = setTimeout(() => controller.abort(), timeout);

//   try {
//     const res = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//       signal: controller.signal,
//     });

//     if (!res.ok) {
//       const txt = await res.text().catch(() => "");
//       throw new Error(`HTTP ${res.status} ${txt}`);
//     }
//     return res.json();
//   } finally {
//     clearTimeout(id);
//   }
// }

// export async function fetchRecommendations(
//   productId: number,
//   userId?: number,
//   topN = 6,
//   alpha?: number,
//   beta?: number
// ): Promise<RecommendResponse> {
//   try {
//     // same-origin default: /api/recommend/hybrid (local route)
//     const base = API_BASE || "";
//     return await postJSON(`${base}/api/recommend/hybrid`, {
//       product_id: productId,
//       user_id: userId,
//       top_n: topN,
//       alpha,
//       beta,
//     });
//   } catch (e) {
//     console.warn("fetchRecommendations fallback", e);
//     return { recommendations: [] };
//   }
// }

// export async function fetchHybridRecommendations(productId: number, limit = 6): Promise<RecommendResponse> {
//   return fetchRecommendations(productId, undefined, limit);
// }

// src/api/recommend.ts
import demoProductsRaw from "@/data/demo_products_500.json";
import type { Product } from "@/types";

const demoProducts = demoProductsRaw as unknown as Product[];
const API_BASE = (import.meta.env.VITE_API_BASE ?? "http://localhost:8000").replace(/\/$/, "");

export type Recommendation = Product & {
  why?: string;
  confidence?: number;
};

// ... (postJSON 함수는 기존과 동일하게 유지)

/**
 * AI API가 실패했을 때 실행될 로컬 추천 엔진
 */
function getLocalFallback(productId: number, topN: number): Recommendation[] {
  const current = demoProducts.find(p => p.id === productId);
  if (!current) {
    // 상품을 못 찾으면 랜덤하게라도 반환
    return demoProducts.slice(0, topN).map(p => ({ ...p, why: "Featured System" }));
  }

  // 1. 현재 상품의 카테고리 추출 (배열 또는 단일 문자열 대응)
  const currentCats = Array.isArray(current.categories)
    ? current.categories
    : [(current as any).category].filter(Boolean);

  // 2. 같은 카테고리를 가진 다른 상품들 필터링
  const related = demoProducts.filter(p => {
    if (p.id === productId) return false;
    const pCats = Array.isArray(p.categories) ? p.categories : [(p as any).category].filter(Boolean);
    return pCats.some(c => currentCats.includes(c));
  });

  // 3. 결과가 적으면 아무 상품이나 추가하여 topN을 맞춤
  let finalRecs = related.length > 0 ? related : demoProducts.filter(p => p.id !== productId);

  return finalRecs
    .sort(() => 0.5 - Math.random()) // 무작위성 부여
    .slice(0, topN)
    .map(p => ({
      ...p,
      confidence: 0.85 + Math.random() * 0.1,
      why: `Matches ${currentCats[0] || 'System'} Profile`
    }));
}

export async function fetchRecommendations(
  productId: number,
  user_id?: number,
  topN = 6,
  alpha?: number,
  beta?: number,
  signal?: AbortSignal
): Promise<{ recommendations: Recommendation[] }> {
  try {
    const base = API_BASE || "";
    const data = await postJSON(
      `${base}/api/recommend/hybrid`,
      { product_id: productId, user_id: userId, top_n: topN, alpha, beta },
      { signal }
    );

    // API 응답이 유효한지 확인
    if (data && (data.recommendations || Array.isArray(data))) {
      return { recommendations: Array.isArray(data) ? data : data.recommendations };
    }
    throw new Error("Invalid API Response");

  } catch (e: any) {
    // Abort 에러가 아닐 때만 로컬 Fallback 실행
    if (e.name === "AbortError") return { recommendations: [] };

    console.warn("AI Engine Offline. Initializing local heuristic matching...");
    return { recommendations: getLocalFallback(productId, topN) };
  }
}

export async function fetchHybridRecommendations(
  productId: number,
  limit = 6,
  signal?: AbortSignal
): Promise<{ recommendations: Recommendation[] }> {
  return fetchRecommendations(productId, undefined, limit, undefined, undefined, signal);
}
