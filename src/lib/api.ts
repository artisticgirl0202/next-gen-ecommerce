// src/lib/api.ts
const API_BASE = (import.meta.env.VITE_API_BASE ?? "http://localhost:8000").replace(/\/$/, "");

export interface ProductDto {
  id: number;
  name: string;
  brand?: string;
  price: number;
  image: string;
  rating?: number;
  description?: string;
  categories?: string[];
  category: string;
  specs?: Record<string, string>;
}

// returns { products, page, page_size, total } (and also items/pageSize for compatibility)
export async function fetchProductsPage(page = 1, pageSize = 12) {
  const url = `${API_BASE}/api/products?page=${page}&page_size=${pageSize}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`fetchProductsPage failed: ${res.status} ${txt}`);
  }
  const json = await res.json();
  // json should contain products or items
  return json;
}

// convenience: return only array for simple use
export async function fetchProducts(page = 1, pageSize = 12) {
  const json = await fetchProductsPage(page, pageSize);
  const arr = Array.isArray(json.products) ? json.products : Array.isArray(json.items) ? json.items : [];
  return arr;
}
