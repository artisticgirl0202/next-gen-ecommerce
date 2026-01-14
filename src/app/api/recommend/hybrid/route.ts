import { ALL_PRODUCTS } from '@/data/products_indexed';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const productId = body?.product_id;
    const topN = Number(body?.top_n ?? 6);

    // 1. 실제 백엔드 AI 추천 서버(FastAPI)로 요청 전달
    try {
      const response = await fetch('http://localhost:8000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, top_n: topN }),
      });

      if (response.ok) {
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } catch (backendError) {
      console.warn(
        '백엔드 추천 API 호출 실패, 로컬 데이터로 대체합니다:',
        backendError,
      );
    }

    // 2. 백엔드 호출 실패 시 Fallback 로직 (사용자님이 작성하신 코드 유지)
    // ALL_PRODUCTS가 비어있을 수 있으므로 안전하게 처리
    const items =
      Array.isArray(ALL_PRODUCTS) && ALL_PRODUCTS.length > 0
        ? ALL_PRODUCTS.filter((p) => p.id !== productId)
        : [];

    const recommendations = items.slice(0, topN).map((p) => ({
      ...p,
      why: '인덱싱 기반 추천 (Fallback)',
      confidence: 0.5,
    }));

    return new Response(JSON.stringify({ recommendations }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Recommendation Route Error:', error);
    return new Response(
      JSON.stringify({ recommendations: [], error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
