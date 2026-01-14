// src/data/products_indexed.ts
import { CATEGORY_PRODUCTS as BASE_PRODUCTS } from './categoryData';

export type ProductLike = {
  id?: number;
  name?: string;
  price?: number | string;
  image?: string;
  category?: string;
  brand?: string;
  tags?: string[];
  description?: string;
  createdAt?: string | number;
  addedAt?: string | number;
  date?: string | number;
  [k: string]: any;
};

// 전역 상태 변수
export let ALL_PRODUCTS: ProductLike[] = [];
export let PRODUCTS_BY_ID = new Map<number, ProductLike>();
export let PRODUCTS_BY_CATEGORY = new Map<string, Set<number>>();
export let PRODUCTS_BY_BRAND = new Map<string, Set<number>>();
export let PRODUCTS_BY_TAG = new Map<string, Set<number>>();
export let PRICE_INDEX: { price: number; id: number }[] = [];
export let DATE_INDEX: { time: number; id: number }[] = [];

export const updateProductIndexes = (newProducts: ProductLike[]) => {
  const idMap = new Map<number, ProductLike>();

  // 1) 기본 데이터 병합
  if (Array.isArray(BASE_PRODUCTS)) {
    for (const p of BASE_PRODUCTS as ProductLike[]) {
      if (p?.id) idMap.set(Number(p.id), p);
    }
  }

  // 2) 백엔드 데이터 병합
  for (const p of newProducts) {
    if (p?.id) idMap.set(Number(p.id), p);
  }

  const products = Array.from(idMap.values()).sort(
    (a, b) => Number(a.id) - Number(b.id),
  );

  // 전역 변수 업데이트
  ALL_PRODUCTS = products;
  PRODUCTS_BY_ID = new Map(products.map((p) => [Number(p.id), p]));
  PRODUCTS_BY_CATEGORY = new Map();
  PRODUCTS_BY_BRAND = new Map();
  PRODUCTS_BY_TAG = new Map();
  PRICE_INDEX = [];
  DATE_INDEX = [];

  const addTo = (
    map: Map<string, Set<number>>,
    key: string | undefined | null,
    id: number,
  ) => {
    if (!key) return;
    if (!map.has(key)) map.set(key, new Set<number>());
    map.get(key)!.add(id);
  };

  for (const p of products) {
    const pid = Number(p.id);
    addTo(PRODUCTS_BY_CATEGORY, p.category || 'Uncategorized', pid);
    addTo(PRODUCTS_BY_BRAND, p.brand || 'Unknown', pid);
    if (Array.isArray(p.tags))
      p.tags.forEach((t) => addTo(PRODUCTS_BY_TAG, t, pid));

    const priceNum =
      typeof p.price === 'number' ? p.price : parseFloat(String(p.price || 0));
    PRICE_INDEX.push({
      price: Number.isFinite(priceNum) ? priceNum : 0,
      id: pid,
    });
  }

  PRICE_INDEX.sort((a, b) => a.price - b.price);
  PRODUCTS_BY_CATEGORY.set('All', new Set(products.map((p) => Number(p.id))));
  console.log(`[Index] ${products.length}개의 상품 동기화 완료.`);
};

// 초기화
updateProductIndexes([]);

// 백엔드 동기화 (Client-side 전용)
if (typeof window !== 'undefined') {
  fetch('http://localhost:8000/api/products/')
    .then((res) => res.json())
    .then((data) => {
      updateProductIndexes(data.items || []);
    })
    .catch((err) => console.error('백엔드 연결 실패:', err));
}

// Export functions
export function getProductById(id: any) {
  return PRODUCTS_BY_ID.get(Number(id));
}

export function getProductsByCategory(category = 'All', options?: any) {
  const idSet = PRODUCTS_BY_CATEGORY.get(category) || new Set<number>();
  const items = Array.from(idSet)
    .map((id) => PRODUCTS_BY_ID.get(id))
    .filter(Boolean) as ProductLike[];

  // 간단한 페이징/정렬 처리 (옵션이 들어올 경우)
  if (options) {
    // 필요하다면 여기서 sortDir, sortBy 처리 가능
    // ✅ [수정] page, perPage 변수 선언도 주석 처리하여 'Unused' 에러 해결
    // const { page = 1, perPage = 20 } = options;
    // const start = (Number(page) - 1) * Number(perPage);
    // const end = start + Number(perPage);
    // items = items.slice(start, end);
  }

  return { items, total: items.length };
}

export function searchProducts(q: string, _options?: any) {
  const query = q.toLowerCase();
  const items = ALL_PRODUCTS.filter(
    (p) =>
      p.name?.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query),
  );
  return { items, total: items.length };
}

export default {
  ALL_PRODUCTS,
  getProductById,
  getProductsByCategory,
  searchProducts,
};
