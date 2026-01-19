// src/data/products_indexed.ts
import { CATEGORY_PRODUCTS as BASE_PRODUCTS } from './categoryData';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(
  /\/$/,
  '',
);

export type ProductLike = {
  id: number | string; // ID는 숫자와 문자열 모두 허용하도록 확장
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

// --- 전역 상태 변수 (타입 유연화) ---
export let ALL_PRODUCTS: ProductLike[] = [];
export let PRODUCTS_BY_ID = new Map<string | number, ProductLike>();
export let PRODUCTS_BY_CATEGORY = new Map<string, Set<string | number>>();
export let PRODUCTS_BY_BRAND = new Map<string, Set<string | number>>();
export let PRODUCTS_BY_TAG = new Map<string, Set<string | number>>();
export let PRICE_INDEX: { price: number; id: string | number }[] = [];

/**
 * ID를 안전하게 변환하는 헬퍼 함수
 * '123' -> 123 (숫자형 문자열은 숫자로)
 * 'ORD-123' -> 'ORD-123' (일반 문자열은 그대로)
 */
const safeId = (id: any): string | number => {
  if (id === undefined || id === null) return '';
  const num = Number(id);
  return isNaN(num) ? id : num;
};

export const updateProductIndexes = (newProducts: ProductLike[]) => {
  const idMap = new Map<string | number, ProductLike>();

  // 1) 기본 데이터와 백엔드 데이터 병합 (중복 시 백엔드 우선)
const combined =
    newProducts.length > 0
      ? newProducts
      : (Array.isArray(BASE_PRODUCTS) ? BASE_PRODUCTS : []);

  for (const p of combined) {
    if (p && p.id !== undefined) {
      const pid = safeId(p.id);
      idMap.set(pid, { ...p, id: pid }); // ID 타입을 정규화해서 저장
    }
  }

  const products = Array.from(idMap.values());

  // 2) 인덱스 초기화 및 재구축
  ALL_PRODUCTS = products;
  PRODUCTS_BY_ID = idMap;
  PRODUCTS_BY_CATEGORY = new Map();
  PRODUCTS_BY_BRAND = new Map();
  PRODUCTS_BY_TAG = new Map();
  PRICE_INDEX = [];

  const addTo = (
    map: Map<string, Set<string | number>>,
    key: string | undefined | null,
    id: string | number,
  ) => {
    if (!key) return;
    if (!map.has(key)) map.set(key, new Set());
    map.get(key)!.add(id);
  };

  for (const p of products) {
    const pid = p.id;

    // 카테고리/브랜드/태그 인덱싱
    addTo(PRODUCTS_BY_CATEGORY, p.category || 'Uncategorized', pid);
    addTo(PRODUCTS_BY_BRAND, p.brand || 'Unknown', pid);
    if (Array.isArray(p.tags)) {
      p.tags.forEach((t) => addTo(PRODUCTS_BY_TAG, t, pid));
    }

    // 가격 인덱싱
    const priceNum =
      typeof p.price === 'number' ? p.price : parseFloat(String(p.price || 0));
    PRICE_INDEX.push({
      price: Number.isFinite(priceNum) ? priceNum : 0,
      id: pid,
    });
  }

  // 가격 정렬
  PRICE_INDEX.sort((a, b) => a.price - b.price);

  // 'All' 카테고리에 전체 ID 추가
  PRODUCTS_BY_CATEGORY.set('All', new Set(products.map((p) => p.id)));

  console.log(
    `[Index] ${products.length}개의 상품 동기화 완료. (백엔드: ${newProducts.length}개)`,
  );
};

// 초기화 (기본 데이터로 우선 로드)
updateProductIndexes([]);

// --- 백엔드 동기화 로직 ---
if (typeof window !== 'undefined') {
  fetch(`${API_BASE_URL}/api/products/`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      // [핵심 수정] 백엔드가 배열을 주든, 객체(items)를 주든 모두 대응
      const items = Array.isArray(data)
        ? data
        : data.items || data.products || [];
      console.log('📦 백엔드 수신 데이터:', items);
      updateProductIndexes(items);
    })
    .catch((err) => {
      console.error('❌ 백엔드 상품 로드 실패:', err);
      // 실패해도 기존 BASE_PRODUCTS는 유지됨
    });
}

// --- 조회용 Export 함수들 ---

export function getProductById(id: any) {
  return PRODUCTS_BY_ID.get(safeId(id));
}

export function getProductsByCategory(category = 'All', options?: any) {
  const idSet =
    PRODUCTS_BY_CATEGORY.get(category) || new Set<string | number>();

  let items = Array.from(idSet)
    .map((id) => PRODUCTS_BY_ID.get(id))
    .filter(Boolean) as ProductLike[];

  if (options) {
    const { page = 1, perPage = 20 } = options;
    const start = (Number(page) - 1) * Number(perPage);
    const end = start + Number(perPage);
    if (items.length > 0) {
      items = items.slice(start, end);
    }
  }

  return { items, total: idSet.size };
}

export function searchProducts(q: string) {
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
