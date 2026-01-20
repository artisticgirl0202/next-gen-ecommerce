// src/api/products.ts
import { API_BASE_URL } from '@/lib/api-config';
import type { Product } from '@/types';

const API_BASE = API_BASE_URL;

export type ProductDto = {
  id: number;
  name: string;
  brand?: string;
  price: number;
  image: string;
  rating?: number;
  description?: string;
  categories?: string[];
  specs?: Record<string, string>;
};

type ProductsApiResponse = {
  items?: ProductDto[];
  products?: ProductDto[];
  page?: number;
  pageSize?: number;
  page_size?: number;
  total?: number;
};

export async function fetchProductsPage(page = 1, pageSize = 12) {
  // note: relative path -> same origin (Next dev server)
  const url = `${API_BASE || ''}/api/products?page=${page}&page_size=${pageSize}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`fetchProductsPage failed: ${res.status} ${txt}`);
  }
  const json = (await res.json()) as ProductsApiResponse;
  return json;
}

function mapDtoToProduct(d: ProductDto): Product {
  const categoryValue =
    Array.isArray(d.categories) && d.categories.length > 0
      ? d.categories[0]
      : (d as any).category;

  return {
    id: Number(d.id) || 0,
    name: String(d.name ?? ''),
    brand: String(d.brand ?? ''),
    price: Number(d.price) || 0,
    image: String(d.image ?? ''),
    rating: typeof d.rating === 'number' ? d.rating : undefined,
    description: typeof d.description === 'string' ? d.description : undefined,
    // Some sources provide a single `category` or a `categories` array — normalize to first category if available
    category: categoryValue,
    categories: Array.isArray(d.categories) ? d.categories : undefined,
    connectivity:
      typeof d.specs?.connectivity === 'string'
        ? d.specs.connectivity
        : undefined,
    specs: d.specs ? d.specs : undefined,
    reviews: Array.isArray((d as any).reviews) ? (d as any).reviews : undefined,
  } as Product;
}

export async function fetchProducts(page = 1, pageSize = 12) {
  const json = await fetchProductsPage(page, pageSize);
  const arr = Array.isArray(json.products)
    ? json.products
    : Array.isArray(json.items)
      ? json.items
      : [];
  const validProducts = arr
    .filter(item => item && item.id !== undefined && item.name) //  빈 객체 및 필수 필드 누락 제거
    .map(mapDtoToProduct)
    .filter(p => p.id > 0 && p.name); //  ID가 0이거나 이름이 없는 것 제거

  console.log(`📦 fetchProducts: 받은 ${arr.length}개 중 유효한 ${validProducts.length}개 처리`);

  return validProducts;
}
