// src/store/cartStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware'; // 1. 미들웨어 추가

export type CartItem = {
  id: number;
  name: string;
  title?: string;
  price: number;
  image?: string;
  qty: number;
};

type AddItemParam = Partial<CartItem> & {
  id: number;
  qty?: number;
  title?: string;
  name?: string;
  price?: number;
  image?: string;
};

export type CartState = {
  items: CartItem[];
  addItem: (item: AddItemParam) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, delta: number) => void;
  clear: () => void;
  total: () => number;
};

// 2. persist 미들웨어로 감싸기
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const id = item.id;
          const exists = state.items.find((i) => i.id === id);
          const addQty = typeof item.qty === 'number' ? item.qty : 1;

          if (exists) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, qty: i.qty + addQty } : i,
              ),
            };
          }

          const cartItem: CartItem = {
            id,
            name: item.name ?? item.title ?? 'Item',
            title: item.name ?? item.title ?? 'Item',
            price: typeof item.price === 'number' ? item.price : 0,
            image: item.image,
            qty: addQty,
          };

          return { items: [...state.items, cartItem] };
        });
      },
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQty: (id, delta) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
          ),
        })),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((s, it) => s + it.price * it.qty, 0),
    }),
    {
      name: 'cart-storage', // 3. 로컬 스토리지에 저장될 고유 Key 이름
      storage: createJSONStorage(() => localStorage), // 4. 저장소 지정 (기본값이라 생략 가능하지만 명시함)
    },
  ),
);

export default useCart;
