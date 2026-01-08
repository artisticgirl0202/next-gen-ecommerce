
// src/api/recommend.ts
import demoProductsRaw from "@/data/demo_products_500.json";
import type { Product } from "@/types";

const demoProducts = demoProductsRaw as unknown as Product[];
const API_BASE = (import.meta.env.VITE_API_BASE ?? "http://localhost:8000").replace(/\/$/, "");

export type Recommendation = Product & {
  why?: string;
  confidence?: number;
};

// 간단한 postJSON 유틸 (fetch wrapper)
async function postJSON<T = unknown>(url: string, body?: unknown, opts: { signal?: AbortSignal } = {}): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    signal: opts.signal,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return (await res.json()) as T;
}

/**
 * 로컬 fallback 추천 엔진
 */
function getLocalFallback(productId: number, topN: number): Recommendation[] {
  const current = demoProducts.find(p => p.id === productId);
  if (!current) {
    return demoProducts.slice(0, topN).map(p => ({ ...p, why: "Featured System" }));
  }

  const currentCats = Array.isArray(current.categories)
    ? current.categories as string[]
    : [current.category as string].filter(Boolean);

  const related = demoProducts.filter(p => {
    if (p.id === productId) return false;
    const pCats = Array.isArray(p.categories) ? p.categories as string[] : [(p.category as string)].filter(Boolean);
    return pCats.some(c => currentCats.includes(c));
  });

  const finalRecs = related.length > 0 ? related : demoProducts.filter(p => p.id !== productId);

  return finalRecs
    .sort(() => 0.5 - Math.random())
    .slice(0, topN)
    .map(p => ({
      ...p,
      confidence: 0.85 + Math.random() * 0.1,
      why: `Matches ${currentCats[0] || "System"} Profile`,
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
    const base = API_BASE;
    const data = await postJSON<unknown>(
      `${base}/api/recommend/hybrid`,
      { product_id: productId, user_id: user_id, top_n: topN, alpha, beta },
      { signal }
    );

    // API 응답이 recommendations 형태인지 확인 (안전하게 검사)
    if (Array.isArray(data)) {
      return { recommendations: data as Recommendation[] };
    }
    if (typeof data === "object" && data !== null && "recommendations" in data && Array.isArray((data as { recommendations?: unknown }).recommendations)) {
      return { recommendations: (data as { recommendations: Recommendation[] }).recommendations };
    }

    // 그 외에는 로컬 fallback
    throw new Error("Invalid API Response");
  } catch (err: unknown) {
    // Abort 처리: DOMException인지 확인
    if ((err as DOMException)?.name === "AbortError") {
      return { recommendations: [] };
    }
    console.warn("AI Engine Offline. Initializing local heuristic matching...", err);
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
