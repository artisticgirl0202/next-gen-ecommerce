// src/api/recommend.ts
import { MERGED_PRODUCTS } from '@/data/combined_fast';
import type { Product } from '@/types';

/** Recommendation 타입 */
export type Recommendation = Product & {
  why?: string;
  why_en?: string;
  confidence?: number;
};

/** API_BASE: 환경변수 사용 */
import { API_BASE_URL } from '@/lib/api-config';

const API_BASE = API_BASE_URL;

/** * [수정] 로컬 파일 임포트를 사용하여 백엔드 실패 시 대체 데이터 제공
 * 백엔드 호출 실패 시 빈 결과를 반환하거나 에러를 던지도록 변경
 */
function getLocalFallback(productId: number, topN: number): Recommendation[] {
  console.warn(
    `[Fallback] Backend offline. Could not get recommendations for ID: ${productId}`,
  );

  // ✅ [수정] fallbackItems가 정의되지 않았던 문제 해결
  // 임포트한 MERGED_PRODUCTS를 fallbackItems로 사용합니다.
  // 현재 보고 있는 상품(productId)은 추천 목록에서 제외하는 필터링을 추가하면 더 자연스럽습니다.
  const fallbackItems = MERGED_PRODUCTS.filter((p) => p.id !== productId);

  // slice 후 타입 호환을 위해 그대로 반환 (Recommendation의 추가 필드는 optional이므로 호환됨)
  return fallbackItems.slice(0, topN);
}

/** 안전한 POST wrapper */
async function postJSON<T = unknown>(
  url: string,
  body?: unknown,
  opts: { signal?: AbortSignal } = {},
): Promise<T> {
  try {
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
    if (err.name === 'AbortError') throw err;
    console.error('[postJSON] network/error', err);
    throw err;
  }
}

/**
 * fetchHybridRecommendations
 * - 백엔드 DB의 데이터를 최우선으로 가져옵니다.
 */
export async function fetchHybridRecommendations(
  productId: number | string,
  k = 6,
  signal?: AbortSignal,
): Promise<{ recommendations: Recommendation[] }> {
  const pid = Number(productId);

  if (!Number.isFinite(pid)) {
    return { recommendations: [] };
  }

  const url = `${API_BASE.replace(/\/$/, '')}/api/recommend/hybrid`;
  const payload = { product_id: pid, k };

  try {
    // 1. 백엔드 API 호출 (실제 DB 데이터 요청)
    const rawData: any = await postJSON(url, payload, { signal });
    // console.log('🔥 [Hybrid Debug] Raw Response from Backend:', rawData);

    let data: any[] = [];

    // 2. 응답 구조 정규화 (백엔드 형태에 맞춤)
    if (Array.isArray(rawData)) {
      data = rawData;
    } else if (
      rawData.recommendations &&
      Array.isArray(rawData.recommendations)
    ) {
      data = rawData.recommendations;
    } else if (rawData.items && Array.isArray(rawData.items)) {
      data = rawData.items;
    }

    const normalized: Recommendation[] = data.map((item: any) => ({
      id: Number(item.id),
      name: item.name ?? item.title ?? `Product ${item.id}`,
      title: item.title ?? item.name,
      price: Number(item.price ?? 0),
      image: item.image ?? '',
      why: item.why ?? item.reason ?? 'AI Based Recommendation',
      why_en:
        typeof item.why_en === 'string'
          ? item.why_en
          : undefined,
      confidence: typeof item.confidence === 'number' ? item.confidence : 0.4,
    }));

    return { recommendations: normalized };
  } catch (err: any) {
    if (err.name === 'AbortError') return { recommendations: [] };

    // 백엔드 오류 시 로컬 Fallback 실행
    console.warn(
      '[fetchHybridRecommendations] Backend failed, returning empty recommendations',
    );
    return { recommendations: getLocalFallback(pid, k) };
  }
}
