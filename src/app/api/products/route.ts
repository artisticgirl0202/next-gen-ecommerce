// src/app/api/products/route.ts
import products from "@/data/demo_products_500.json";
import { NextResponse } from "next/server";

function normalizePageParams(rawPage, rawPageSize) {
  const page = Math.max(1, Number(rawPage ?? "1") || 1);
  const pageSize = Number(rawPageSize ?? "") || Number(rawPageSize === null ? 24 : rawPageSize) || 24;
  return { page, pageSize };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const rawPage = searchParams.get("page");
  const rawPageSize = searchParams.get("page_size") ?? searchParams.get("pageSize");
  const { page, pageSize } = normalizePageParams(rawPage, rawPageSize);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const sort = searchParams.get("sort");

  let items = Array.isArray(products) ? [...products] : [];

  if (category && category !== "All") {
    items = items.filter(p => Array.isArray(p.categories) ? p.categories.includes(category) : p.category === category);
  }
  if (q) {
    const qq = q.toLowerCase();
    items = items.filter(p => (p.name ?? "").toString().toLowerCase().includes(qq) || (p.brand ?? "").toString().toLowerCase().includes(qq));
  }
  if (sort === "price_low") items.sort((a,b)=> (a.price||0)-(b.price||0));
  if (sort === "price_high") items.sort((a,b)=> (b.price||0)-(a.price||0));
  if (!sort) items.sort((a,b)=> (b.id||0)-(a.id||0));

  const total = items.length;
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return NextResponse.json({
    items: paged,
    total,
    page,
    pageSize,
    products: paged,
    page_size: pageSize,
  });
}
