// src/api/integration.ts

// --- 1. Orders API Types ---
export interface OrderItem {
  productId: number;
  qty: number;
  price: number;
}
export interface OrderRequest {
  userId: number;
  items: OrderItem[];
}
export interface OrderResponse {
  id: number;
  orderNo: string;
  status: string;
  totalAmount: number;
}

// --- 3. AI Feedback Types ---
export interface AIFeedbackRequest {
  userId: string | number;
  orderId?: string | number;
  productId?: string | number;
  action: string; // 'view_details', 'add_to_cart', 'purchase', 'view' 등
}

// --- 4. Recommendation Types ---
export interface RecRequest {
  product_id: number;
  k?: number;
}
export interface RecItem {
  id: number;
  name: string;
  price: number;
  image: string;
  why: string; // 예: "Content Similarity", "User Behavior"
  confidence: number;
}
export interface RecResponse {
  recommendations: RecItem[];
}

// --- API Functions ---

export const createOrderAPI = async (
  data: OrderRequest,
): Promise<OrderResponse> => {
  const res = await fetch('/api/orders/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Order Failed');
  return res.json();
};

// 3) AI 피드백 전송 (✅ 수정됨: 강력한 디버깅 로그 추가)
export const sendAIFeedbackAPI = async (data: AIFeedbackRequest) => {
  try {
    const safeUserId = Number(data.userId);
    const safeProductId = data.productId ? Number(data.productId) : null;

    // [수정 포인트] orderId가 없으면 null이 아니라 -1을 할당합니다.
    // 백엔드가 null을 허용하지 않으므로, "주문 없음"을 -1로 표현합니다.
    const safeOrderId = data.orderId ? Number(data.orderId) : -1;

    const payload = {
      user_id: isNaN(safeUserId) ? 1 : safeUserId,
      action: data.action,
      product_id: safeProductId,
      order_id: safeOrderId, // 이제 null 대신 -1이 전송됩니다.
    };

    // console.log('[AI Debug] Sending:', payload); // 디버깅용

    const res = await fetch('/api/ai/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(
        `[AI Error 422] Action: ${data.action}\nReason:`,
        JSON.stringify(errorData, null, 2),
      );
      return;
    }

    console.log(`[AI Success] ${data.action}`);
  } catch (e) {
    console.warn('[AI Network Error]', e);
  }
};
// 4) 추천 요청 (✅ 수정됨)
// limit(k)를 인자로 받도록 수정하여, MyPage에서는 10개를 요청할 수 있게 합니다.
export const fetchHybridRecsAPI = async (
  productId: number,
  limit: number = 10, // 기본값 10으로 변경 (슬라이더용)
): Promise<RecItem[]> => {
  try {
    const res = await fetch('/api/recommend/hybrid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, k: limit }),
    });

    if (!res.ok) return [];
    const json = await res.json();
    return json.recommendations || [];
  } catch (e) {
    console.error('Failed to fetch recommendations:', e);
    return [];
  }
};
