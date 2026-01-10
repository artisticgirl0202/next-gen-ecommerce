// src/api/recommend.ts
import demoProductsRaw from '@/data/demo_products_500.json';
import type { Product } from '@/types';

const demoProducts = demoProductsRaw as unknown as Product[];

// 환경변수에서 API_BASE를 읽되, 끝의 슬래시를 제거
const API_BASE = (
  import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'
).replace(/\/$/, '');

export type Recommendation = Product & {
  why?: string;
  confidence?: number;
};

/**
 * 안전한 fetch POST wrapper
 * - 네트워크 에러를 던짐
 * - 응답이 ok가 아니면 에러 던짐
 */
async function postJSON<T = unknown>(
  url: string,
  body?: unknown,
  opts: { signal?: AbortSignal } = {},
): Promise<T> {
  // 디버깅: 호출 URL 및 짧은 바디 로깅
  try {
    console.debug('[postJSON] POST', url, body ? { body } : {});
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: opts.signal,
      credentials: 'include', // 필요시 쿠키 전송
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    // 네트워크 계층 오류(예: ECONNREFUSED)도 상위로 던집니다.
    console.error('[postJSON] network/error', err);
    throw err;
  }
}

/*
 * 로컬 fallback 추천 엔진
 */
function getLocalFallback(productId: number, topN: number) {
  const current = demoProducts.find((p) => p.id === productId);
  if (!current) {
    return demoProducts
      .slice(0, topN)
      .map((p) => ({ ...p, why: 'Featured System' }));
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
 * - API 호출을 시도하되,
 * - 배포된 프론트엔드에서 실수로 `localhost`를 가리키고 있다면 호출 대신 로컬 fallback을 반환
 * - 네트워크/서버 오류 시 로컬 fallback을 반환
 */
export async function fetchRecommendations(
  productId: number,
  user_id?: number,
  topN = 6,
  alpha?: number,
  beta?: number,
  signal?: AbortSignal,
): Promise<{ recommendations: Recommendation[] }> {
  try {
    // 배포 환경 보호: 브라우저에서 실행 중이고 호스트가 localhost가 아니면
    if (typeof window !== 'undefined' && window.location) {
      const currentHost = window.location.hostname;
      if (currentHost !== 'localhost' && API_BASE.includes('localhost')) {
        console.warn(
          '[fetchRecommendations] Skipping call to localhost from deployed frontend. ' +
            `window.host=${currentHost} API_BASE=${API_BASE}. Returning local fallback.`,
        );
        return { recommendations: getLocalFallback(productId, topN) };
      }
    }

    const base = API_BASE;
    const url = `${base}/api/recommend/hybrid`;
    const payload = {
      product_id: productId,
      user_id: user_id,
      k: topN,
      alpha,
      beta,
    };

    // 디버깅 로깅
    console.debug('[fetchRecommendations] calling', url, payload);

    const data: unknown = await postJSON<unknown>(url, payload, { signal });

    // API 응답이 recommendations 형태인지 확인 (안전하게 검사)
    if (Array.isArray(data)) {
      return { recommendations: data as Recommendation[] };
    }
    if (
      typeof data === 'object' &&
      data !== null &&
      'recommendations' in data &&
      Array.isArray((data as { recommendations?: unknown }).recommendations)
    ) {
      return {
        recommendations: (data as { recommendations: Recommendation[] })
          .recommendations,
      };
    }

    // 응답 형태가 예상과 다른 경우 예외로 처리하여 fallback으로 넘어가게 함
    throw new Error('Invalid API Response shape');
  } catch (err: unknown) {
    // Abort 처리: DOMException인지 확인
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

export async function fetchHybridRecommendations(
  productId: number,
  limit = 6,
  signal?: AbortSignal,
): Promise<{ recommendations: Recommendation[] }> {
  return fetchRecommendations(
    productId,
    undefined,
    limit,
    undefined,
    undefined,
    signal,
  );
}
