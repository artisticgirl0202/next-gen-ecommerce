// src/api/orders.ts
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(
  /\/$/,
  '',
);

export interface OrderItem {
  productId: number;
  qty: number;
}

export interface OrderRequest {
  userId: number;
  items: OrderItem[];
}

export interface OrderResponse {
  id: number;
  total: number;
  status: string;
  items: OrderItem[];
  // ...백엔드 반환 스펙에 맞춰 확장
}

/**
 * 주문 생성: 백엔드 /api/orders에 POST
 */
export async function createOrder(
  payload: OrderRequest,
): Promise<OrderResponse> {
  const res = await fetch(`${API_BASE_URL}/api/orders/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      throw new Error(
        `Order create failed: ${res.status} ${JSON.stringify(data)}`,
      );
    }
    return data as OrderResponse;
  } catch {
    // JSON 파싱 실패 또는 기타 에러 — 에러 메시지에 디버깅 정보 포함
    const status = res.status ?? 'unknown';
    const body = typeof text === 'string' ? text : JSON.stringify(text);
    throw new Error(`Order create parse/error: ${status} ${body}`);
  }
}
