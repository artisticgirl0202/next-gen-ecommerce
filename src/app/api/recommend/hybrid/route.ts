// src/app/api/recommend/hybrid/route.ts
import products from "@/data/demo_products_500.json"; // demo 파일을 프로젝트에 넣어야 함

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const productId = body?.product_id;
  const topN = Number(body?.top_n ?? 6);

  // simple fallback: return topN products excluding the product itself
  const items = Array.isArray(products) ? products.filter((p) => p.id !== productId) : [];
  const recommendations = items.slice(0, topN).map((p) => ({ ...p, why: "Demo fallback", confidence: 0.5 }));
  return new Response(JSON.stringify({ recommendations }), { headers: { "Content-Type": "application/json" } });
}
