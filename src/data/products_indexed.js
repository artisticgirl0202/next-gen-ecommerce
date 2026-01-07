// src/data/products_indexed.js
// High-performance client-side product index and query utilities
// Exports:
//  - ALL_PRODUCTS: merged array (base + demo)
//  - PRODUCTS_BY_ID: Map<id, product>
//  - PRODUCTS_BY_CATEGORY: Map<category, Set<id>>
//  - getProductsByCategory(category, { page, perPage, sortBy, sortDir, q }) => { items, total, page, pageSize }
//  - getProductById(id)
//  - searchProducts(q, { page, perPage, sortBy, sortDir })

import { CATEGORY_PRODUCTS as BASE_PRODUCTS } from './categoryData';
import demoProducts from './demo_products_500.json';

// ---------- helpers ----------
function lowerBound(arr, value, keyFn = (x) => x) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (keyFn(arr[mid]) < value) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
function upperBound(arr, value, keyFn = (x) => x) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (keyFn(arr[mid]) <= value) lo = mid + 1;
    else hi = mid;
  }
  return lo - 1;
}
function intersectSets(sets) {
  if (!sets || sets.length === 0) return new Set();
  sets.sort((a, b) => a.size - b.size);
  const res = new Set(sets[0]);
  for (let i = 1; i < sets.length; i++) {
    const s = sets[i];
    for (const v of Array.from(res)) {
      if (!s.has(v)) res.delete(v);
    }
    if (res.size === 0) break;
  }
  return res;
}
function idsToProducts(idsSet, productsById) {
  const out = [];
  for (const id of idsSet) {
    const p = productsById.get(id);
    if (p) out.push(p);
  }
  return out;
}

// ---------- build merged list and indexes ----------
const buildIndexes = ({ prefer = 'base' } = {}) => {
  // 1) merge by id (base priority)
  const idMap = new Map();
  // base first
  for (const p of BASE_PRODUCTS) {
    if (p && typeof p.id === 'number') idMap.set(p.id, p);
  }
  // demo next - only add if id not present (base priority)
  for (const p of demoProducts) {
    if (p && typeof p.id === 'number' && !idMap.has(p.id)) idMap.set(p.id, p);
  }

  const products = Array.from(idMap.values()).sort((a, b) => (a.id || 0) - (b.id || 0));
  const productsById = new Map(products.map((p) => [p.id, p]));

  // indexes
  const productsByCategory = new Map(); // category -> Set<id>
  const productsByBrand = new Map(); // brand -> Set<id>
  const productsByTag = new Map(); // tag -> Set<id>
  const priceIndex = []; // sorted [{price, id}]
  const dateIndex = []; // sorted [{time, id}] if applicable

  const addTo = (map, key, id) => {
    if (key === undefined || key === null) return;
    if (!map.has(key)) map.set(key, new Set());
    map.get(key).add(id);
  };

  for (const p of products) {
    addTo(productsByCategory, p.category || 'Uncategorized', p.id);
    addTo(productsByBrand, p.brand || 'Unknown', p.id);
    if (Array.isArray(p.tags)) {
      for (const t of p.tags) addTo(productsByTag, t, p.id);
    }
    const priceNum = typeof p.price === 'number' ? p.price : parseFloat(p.price || 0);
    priceIndex.push({ price: Number.isFinite(priceNum) ? priceNum : 0, id: p.id });

    const maybeDate = p.createdAt || p.addedAt || p.date || null;
    if (maybeDate) {
      const ts = typeof maybeDate === 'number' ? maybeDate : Date.parse(maybeDate);
      if (!Number.isNaN(ts)) dateIndex.push({ time: ts, id: p.id });
    }
  }

  priceIndex.sort((a, b) => a.price - b.price);
  dateIndex.sort((a, b) => a.time - b.time);

  // add All key
  productsByCategory.set('All', new Set(products.map((p) => p.id)));

  return {
    products,
    productsById,
    productsByCategory,
    productsByBrand,
    productsByTag,
    priceIndex,
    dateIndex,
  };
};

const {
  products: ALL_PRODUCTS,
  productsById: PRODUCTS_BY_ID,
  productsByCategory: PRODUCTS_BY_CATEGORY,
  productsByBrand: PRODUCTS_BY_BRAND,
  productsByTag: PRODUCTS_BY_TAG,
  priceIndex: PRICE_INDEX,
  dateIndex: DATE_INDEX,
} = buildIndexes({ prefer: 'base' });

// ---------- query API (synchronous) ----------
/**
 * getProductsByCategory(category, { page, perPage, sortBy, sortDir, q })
 * returns { items, total, page, pageSize, totalPages }
 * sortBy: 'id' | 'price' | 'name'
 * sortDir: 'asc' | 'desc'
 */
function getProductsByCategory(
  category = 'All',
  { page = 1, perPage = 10000, sortBy = 'id', sortDir = 'desc', q = undefined } = {}
) {
  // candidate ids
  let idSet = PRODUCTS_BY_CATEGORY.get(category) || new Set();

  // if q provided, do a simple filter over the category candidates (this is faster than scanning all products)
  let items;
  if (q && String(q).trim()) {
    const ql = String(q).toLowerCase();
    // filter ids by checking fields
    const filtered = [];
    for (const id of idSet) {
      const p = PRODUCTS_BY_ID.get(id);
      if (!p) continue;
      const hay = `${p.name || ''} ${p.brand || ''} ${p.description || ''}`.toLowerCase();
      if (hay.indexOf(ql) !== -1) filtered.push(p);
    }
    items = filtered;
  } else {
    // map ids -> products
    items = idsToProducts(idSet, PRODUCTS_BY_ID);
  }

  // sort
  const dir = sortDir === 'desc' ? -1 : 1;
  if (sortBy === 'price') {
    items.sort((a, b) => dir * ((a.price || 0) - (b.price || 0)));
  } else if (sortBy === 'name') {
    items.sort((a, b) => dir * String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' }));
  } else {
    // id
    items.sort((a, b) => dir * ((a.id || 0) - (b.id || 0)));
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * perPage;
  const slice = items.slice(start, start + perPage);

  return { items: slice, total, page: safePage, pageSize: perPage, totalPages };
}

function getProductById(id) {
  return PRODUCTS_BY_ID.get(id);
}

function searchProducts(q, { page = 1, perPage = 24, sortBy = 'id', sortDir = 'desc' } = {}) {
  const query = String(q || '').trim().toLowerCase();
  if (!query) return getProductsByCategory('All', { page, perPage, sortBy, sortDir });

  // For search, scan ALL_PRODUCTS but this can be optimized later with inverted index
  const results = [];
  for (const p of ALL_PRODUCTS) {
    const hay = `${p.name || ''} ${p.brand || ''} ${p.description || ''}`.toLowerCase();
    if (hay.indexOf(query) !== -1) results.push(p);
  }

  const dir = sortDir === 'desc' ? -1 : 1;
  if (sortBy === 'price') {
    results.sort((a, b) => dir * ((a.price || 0) - (b.price || 0)));
  } else if (sortBy === 'name') {
    results.sort((a, b) => dir * String(a.name || '').localeCompare(String(b.name || ''), undefined, { sensitivity: 'base' }));
  } else {
    results.sort((a, b) => dir * ((a.id || 0) - (b.id || 0)));
  }

  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * perPage;
  const slice = results.slice(start, start + perPage);

  return { items: slice, total, page: safePage, pageSize: perPage, totalPages };
}

// ---------- exports ----------
export {
  ALL_PRODUCTS, DATE_INDEX, getProductById, getProductsByCategory, PRICE_INDEX, PRODUCTS_BY_BRAND, PRODUCTS_BY_CATEGORY, PRODUCTS_BY_ID, PRODUCTS_BY_TAG, searchProducts
};

export default {
  ALL_PRODUCTS,
  PRODUCTS_BY_ID,
  PRODUCTS_BY_CATEGORY,
  getProductsByCategory,
  getProductById,
  searchProducts,
};
