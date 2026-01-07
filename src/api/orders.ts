// src/api/orders.ts
export interface OrderRequest {
  userId: number;
  items: { productId: number; qty: number }[];
}
export interface OrderResponse {
  id: number;
  total: number;
  status: string;
  items: any[];
  // ...백엔드 반환 스펙에 맞춰 확장
}

/**
 * 주문 생성: 백엔드 /api/orders에 POST
 */
export async function createOrder(payload: OrderRequest): Promise<OrderResponse> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  // 서버가 JSON을 주지 않으면 디버깅에 도움되도록 text로 먼저 읽음
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      // 422 등의 에러를 호출자에게 전달 (자세한 내용 포함)
      throw new Error(`Order create failed: ${res.status} ${JSON.stringify(data)}`);
    }
    return data as OrderResponse;
  } catch (err) {
    // JSON 파싱 실패 또는 기타 에러
    throw new Error(`Order create parse/error: ${res.status} ${text}`);
  }
}
