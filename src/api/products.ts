
// // src/api/products.ts
// const API_BASE = (import.meta.env.VITE_API_BASE ?? "http://localhost:8000").replace(/\/$/, "");

// export interface Product {
//   id: number;
//   name: string;
//   price: number;
//   image: string;
// }

// export type ProductDto = {
//   id: number;
//   name: string;
//   brand: string;
//   price: number;
//   image: string;
//   rating?: number;
//   description?: string;
//   categories?: string[];
//   specs?: Record<string, string>;
// };

// // returns { products, page, page_size, total }
// // for useInfiniteQuery we return the whole payload, but wrapper below returns array for simple use
// export async function fetchProductsPage(page = 1, pageSize = 12) {
//   const res = await fetch(`${API_BASE}/products?page=${page}&page_size=${pageSize}`);
//   if (!res.ok) {
//     const txt = await res.text();
//     throw new Error(`fetchProductsPage failed: ${res.status} ${txt}`);
//   }
//   return res.json(); // { products: [...], page, page_size, total }
// }

// // small convenience for non-infinite queries: return array
// export async function fetchProducts(page = 1, pageSize = 12) {
//   const json = await fetchProductsPage(page, pageSize);
//   return Array.isArray(json.products) ? json.products : [];
// }


// src/api/products.ts
const API_BASE = (import.meta.env.VITE_API_BASE ?? "").replace(/\/$/, "");

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
  const url = `${API_BASE || ""}/api/products?page=${page}&page_size=${pageSize}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`fetchProductsPage failed: ${res.status} ${txt}`);
  }
  const json = (await res.json()) as ProductsApiResponse;
  return json;
}

export async function fetchProducts(page = 1, pageSize = 12) {
  const json = await fetchProductsPage(page, pageSize);
  return Array.isArray(json.products)
    ? json.products
    : Array.isArray(json.items)
    ? json.items
    : [];
}
