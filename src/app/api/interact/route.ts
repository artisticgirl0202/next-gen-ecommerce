// src/app/api/interact/route.ts
export async function POST(_req: Request) {
  try {
    return new Response(null, { status: 204 });
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
