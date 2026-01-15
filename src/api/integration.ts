// src/api/integration.ts

// ✅ [추가됨] 환경 변수에서 기본 URL을 가져옵니다.
// 로컬 개발 시(.env가 없거나 비어있을 때)에는 빈 문자열('')이 되어 vite.config.ts의 프록시(/api)를 탑니다.
// 배포 시(Vercel)에는 설정한 https://...onrender.com 주소가 들어갑니다.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
  // ✅ [수정됨] BASE_URL 추가
  const res = await fetch(`${BASE_URL}/api/orders/`, {
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
    const safeOrderId = data.orderId ? Number(data.orderId) : -1;

    const payload = {
      user_id: isNaN(safeUserId) ? 1 : safeUserId,
      action: data.action,
      product_id: safeProductId,
      order_id: safeOrderId,
    };

    // ✅ [수정됨] BASE_URL 추가
    const res = await fetch(`${BASE_URL}/api/ai/feedback`, {
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
export const fetchHybridRecsAPI = async (
  productId: number,
  limit: number = 10,
): Promise<RecItem[]> => {
  try {
    // ✅ [수정됨] BASE_URL 추가
    const res = await fetch(`${BASE_URL}/api/recommend/hybrid`, {
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
