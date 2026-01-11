// src/api/recommend.ts
import demoProductsRaw from '@/data/demo_products_500.json';
import type { Product } from '@/types';

const demoProducts = demoProductsRaw as unknown as Product[];

/** Recommendation 타입 */
export type Recommendation = Product & {
  why?: string;
  confidence?: number;
};

/** API_BASE: 환경변수 사용 (끝의 슬래시 제거) */
const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  'http://localhost:8000';

/** 안전한 POST wrapper */
async function postJSON<T = unknown>(
  url: string,
  body?: unknown,
  opts: { signal?: AbortSignal } = {},
): Promise<T> {
  try {
    console.debug('[postJSON] POST', url, body ? { body } : {});
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: opts.signal,
      credentials: 'include',
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return (await res.json()) as T;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw err;
    }

    console.error('[postJSON] network/error', err);
    throw err;
  }
}

function getLocalFallback(productId: number, topN: number) {
  const current = demoProducts.find((p) => p.id === productId);
  if (!current) {
    return demoProducts
      .slice(0, topN)
      .map((p) => ({ ...p, why: 'Featured System', confidence: 0.75 }));
  }

  const currentCats = Array.isArray(current.categories)
    ? (current.categories as string[])
    : [current.category as string].filter(Boolean);

  const related = demoProducts.filter((p) => {
    if (p.id === productId) return false;
    const pCats = Array.isArray(p.categories)
      ? (p.categories as string[])
      : [p.category as string].filter(Boolean);
    return pCats.some((c) => currentCats.includes(c));
  });

  const finalRecs =
    related.length > 0
      ? related
      : demoProducts.filter((p) => p.id !== productId);

  return finalRecs
    .sort(() => 0.5 - Math.random())
    .slice(0, topN)
    .map((p) => ({
      ...p,
      confidence: 0.85 + Math.random() * 0.1,
      why: `Matches ${currentCats[0] || 'System'} Profile`,
    }));
}

/**
 * fetchRecommendations
 * - 정상 응답이면 { recommendations: Recommendation[] } 반환
 * - 문제(네트워크, 형식 불일치)시 로컬 fallback 반환
 */
export async function fetchRecommendations(
  productId: number,
  user_id?: number | string,
  topN = 6,
  alpha?: number,
  beta?: number,
  signal?: AbortSignal,
): Promise<{ recommendations: Recommendation[] }> {
  try {
    // 배포된 프론트가 localhost API를 호출하지 못하도록 보호
    if (typeof window !== 'undefined' && window.location) {
      const currentHost = window.location.hostname;
      if (currentHost !== 'localhost' && API_BASE.includes('localhost')) {
        console.warn(
          '[fetchRecommendations] Skipping call to localhost from deployed frontend.',
          `window.host=${currentHost} API_BASE=${API_BASE}`,
        );
        return { recommendations: getLocalFallback(productId, topN) };
      }
    }

    const url = `${API_BASE.replace(/\/$/, '')}/api/recommend/hybrid`;
    const payload: Record<string, unknown> = {
      product_id: productId,
      top_n: topN,
    };
    if (user_id !== undefined) payload.user_id = user_id;
    if (alpha !== undefined) payload.alpha = alpha;
    if (beta !== undefined) payload.beta = beta;

    console.debug('[fetchRecommendations] calling', url, payload);

    const raw = await postJSON<unknown>(url, payload, { signal });

    // 다양한 응답 형태 정규화
    if (Array.isArray(raw)) {
      return { recommendations: raw as Recommendation[] };
    }
    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      if (Array.isArray(obj.recommendations)) {
        return { recommendations: obj.recommendations as Recommendation[] };
      }
      if (Array.isArray(obj.items)) {
        return { recommendations: obj.items as Recommendation[] };
      }
      if (Array.isArray(obj.data)) {
        return { recommendations: obj.data as Recommendation[] };
      }
    }

    throw new Error('Invalid API Response shape');
  } catch (err: unknown) {
    if ((err as DOMException)?.name === 'AbortError') {
      return { recommendations: [] };
    }
    console.warn(
      'AI Engine Offline (recommendation). Using local fallback.',
      err,
    );
    return { recommendations: getLocalFallback(productId, topN) };
  }
}

/** 간단한 wrapper: 프론트에서 이 함수를 사용하면 일관된 결과를 받음 */
export async function fetchHybridRecommendations(
  productId: number | string,
  k = 6,
  signal?: AbortSignal,
): Promise<{ recommendations: Recommendation[] }> {
  const pid = Number(productId);

  if (!Number.isFinite(pid)) {
    return {
      recommendations: getLocalFallback(0, k).map((p) => ({
        id: p.id,
        name: p.name,
        title: p.name, // p.title 대신 p.name 사용
        price: p.price,
        image: p.image,
        why: p.why ?? '기본 추천',
        confidence: p.confidence ?? 0.3,
      })),
    };
  }

  const url = `${API_BASE.replace(/\/$/, '')}/api/recommend/hybrid`;

  // ✅ curl과 100% 동일
  const payload = {
    product_id: pid,
    k,
  };

  try {
    const data: any = await postJSON(url, payload, { signal });

    if (!Array.isArray(data)) {
      throw new Error('Hybrid API response is not an array');
    }

    const normalized: Recommendation[] = data.map((item: any) => ({
      id: Number(item.id),
      name: item.name ?? item.title ?? `Product ${item.id}`,
      title: item.title ?? item.name,
      price: Number(item.price ?? 0),
      image: item.image ?? '',

      // 🔑 추천 이유 복원 (가장 중요)
      why:
        item.why ??
        item.reason ??
        '이 상품과 유사한 구매·콘텐츠 패턴 기반 추천',

      confidence:
        typeof item.confidence === 'number'
          ? item.confidence
          : typeof item.score === 'number'
            ? item.score
            : 0.4,
    }));

    return { recommendations: normalized };
  } catch (err) {
    console.warn('[fetchHybridRecommendations] fallback used', err);

    return {
      recommendations: getLocalFallback(pid, k).map((p) => ({
        id: p.id,
        name: p.name,
        title: p.name, // p.title 대신 p.name 사용
        price: p.price,
        image: p.image,
        why: p.why ?? '대체 추천',
        confidence: p.confidence ?? 0.25,
      })),
    };
  }
}
