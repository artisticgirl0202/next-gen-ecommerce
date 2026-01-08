
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

import type { Product } from "@/types";

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

function mapDtoToProduct(d: ProductDto): Product {
  return {
    id: Number(d.id) || 0,
    name: String(d.name ?? ""),
    brand: String(d.brand ?? ""),
    price: Number(d.price) || 0,
    image: String(d.image ?? ""),
    rating: typeof d.rating === "number" ? d.rating : undefined,
    description: typeof d.description === "string" ? d.description : undefined,
    // Some sources provide a single `category` or a `categories` array — normalize to first category if available
    category: Array.isArray(d.categories) && d.categories.length > 0 ? d.categories[0] : undefined,
    categories: Array.isArray(d.categories) ? d.categories : undefined,
    connectivity: typeof d.specs?.connectivity === "string" ? d.specs.connectivity : undefined,
    specs: d.specs ? d.specs : undefined,
    reviews: Array.isArray((d as any).reviews) ? (d as any).reviews : undefined,
  } as Product;
}

export async function fetchProducts(page = 1, pageSize = 12) {
  const json = await fetchProductsPage(page, pageSize);
  const arr = Array.isArray(json.products) ? json.products : Array.isArray(json.items) ? json.items : [];
  return arr.map(mapDtoToProduct);
}
