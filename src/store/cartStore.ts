

// import { create } from 'zustand';

// interface CartItem {
//   id: number;
//   title: string;
//   price: number;
//   image: string;
//   qty: number;
// }

// interface CartState {
//   items: CartItem[];
//   addItem: (product: CartItem) => void;
//   updateQty: (id: number, delta: number) => void; // 수량 변경 함수 추가
//   removeItem: (id: number) => void;               // 삭제 함수 추가
// }

// export const useCart = create<CartState>((set) => ({
//   items: [],

//   addItem: (product) => set((state) => {
//     const isExist = state.items.find((item) => item.id === product.id);
//     if (isExist) {
//       return {
//         items: state.items.map((item) =>
//           item.id === product.id ? { ...item, qty: item.qty + 1 } : item
//         ),
//       };
//     }
//     return { items: [...state.items, { ...product, qty: 1 }] };
//   }),

//   // 수량 조절 로직
//   updateQty: (id, delta) => set((state) => ({
//     items: state.items
//       .map((item) =>
//         item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
//       )
//   })),

//   // 아이템 삭제 로직
//   removeItem: (id) => set((state) => ({
//     items: state.items.filter((item) => item.id !== id),
//   })),
// }));
// src/store/cartStore.ts
import { create } from "zustand";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image?: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty"> | CartItem) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clear: () => void;
  total: () => number;
};

export const useCart = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    set((state) => {
      const id = (item as any).id;
      const exists = state.items.find((i) => i.id === id);
      const addQty = ("qty" in item ? (item as any).qty : 1);
      if (exists) {
        return {
          items: state.items.map((i) =>
            i.id === id ? { ...i, qty: i.qty + addQty } : i
          ),
        };
      }
      const cartItem: CartItem = {
        id: (item as any).id,
        name: (item as any).name || (item as any).title || "Item",
        price: (item as any).price || 0,
        image: (item as any).image,
        qty: addQty,
      };
      return { items: [...state.items, cartItem] };
    });
  },
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  updateQty: (id, delta) => set((state) => ({
  items: state.items.map((i) =>
    i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
  )
})),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((s, it) => s + it.price * it.qty, 0),
}));
