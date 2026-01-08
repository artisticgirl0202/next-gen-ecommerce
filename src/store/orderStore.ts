// src/store/orderStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/**
 * 타입 정의
 */
export type OrderItem = {
  productId: number;
  qty: number;
  price: number;
  // optional metadata filled later:
  title?: string;
  image?: string;
  category?: string | null;
};

export type OrderShape = {
  id: number | string;
  userId?: number | string;
  items: OrderItem[];
  total?: number | null;
  status?: string | null;
  // ...any other fields allowed
};

type OrderState = {
  currentOrder: OrderShape | null;
  /**
   * setOrder는 OrderShape | null을 받아 내부에서 안전하게 정규화 후 저장합니다.
   */
  setOrder: (o: OrderShape | null) => void;
  clearOrder: () => void;
};

/**
 * 정규화 유틸: 다양한 필드 네이밍(productId, product_id, id 등)을 통일
 */
function normalizeItem(raw: any): OrderItem {
  const productId = Number(raw?.productId ?? raw?.product_id ?? raw?.id ?? 0) || 0;
  const qty = Number(raw?.qty ?? raw?.quantity ?? 1) || 1;
  const price = Number(raw?.price ?? raw?.unitPrice ?? raw?.amount ?? 0) || 0;

  return {
    productId,
    qty,
    price,
    title: raw?.title ?? raw?.name ?? "",
    image: raw?.image ?? raw?.img ?? "",
    category: raw?.category ?? null,
  };
}

function normalizeOrder(raw: OrderShape | null): OrderShape | null {
  if (!raw) return null;

  // Ensure items array exists and each item is normalized
  const items = Array.isArray((raw as any).items)
    ? (raw as any).items.map((it: any) => normalizeItem(it))
    : [];

  // Normalize id / numeric fields
  const idRaw = (raw as any).id ?? (raw as any).orderNo ?? (raw as any).order_id;
  const id = typeof idRaw === "string" && idRaw.trim() !== "" && !Number.isNaN(Number(idRaw))
    ? Number(idRaw)
    : idRaw ?? raw.id;

  const total = Number((raw as any).total ?? (raw as any).totalAmount ?? (raw as any).amount ?? null);
  const safeTotal = Number.isFinite(total) ? total : null;

  return {
    ...raw,
    id,
    items,
    total: safeTotal,
    status: raw.status ?? null,
  };
}

/**
 * persist의 getStorage 를 SSR-safe하게 제공.
 * (빌드/서버 환경에서 localStorage가 없어도 에러 나지 않도록 함)
 */
const getBrowserStorage = () => {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

// Adapter that always returns a storage-like object (never undefined) so
// `createJSONStorage` can be used safely in SSR and test environments.
const getStorageForPersist = () => {
  const s = getBrowserStorage();
  if (s) return s as Storage;
  // In-memory fallback storage implementing the minimal Storage API
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    setItem: (key: string, value: string) => map.set(key, value),
    removeItem: (key: string) => map.delete(key),
  } as unknown as Storage;
};

/**
 * Zustand 스토어 (persist 포함)
 */
const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      currentOrder: null,
      setOrder: (o) =>
        set(() => ({
          currentOrder: normalizeOrder(o),
        })),
      clearOrder: () =>
        set(() => ({
          currentOrder: null,
        })),
    }),
    {
      name: "nextgen-order-store",
      // Wrap browser storage with createJSONStorage so types match PersistStorage
      storage: createJSONStorage(getStorageForPersist),
    }
  )
);

export default useOrderStore;
