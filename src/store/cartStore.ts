
// src/store/cartStore.ts
// import { create } from "zustand";

// export type CartItem = {
//   id: number;
//   name: string;
//   price: number;
//   image?: string;
//   qty: number;
// };

// type CartState = {
//   items: CartItem[];
//   addItem: (item: Omit<CartItem, "qty"> | CartItem) => void;
//   removeItem: (id: number) => void;
//   updateQty: (id: number, qty: number) => void;
//   clear: () => void;
//   total: () => number;
// };

// export const useCart = create<CartState>((set, get) => ({
//   items: [],
//   addItem: (item) => {
//     set((state) => {
//       const id = (item as any).id;
//       const exists = state.items.find((i) => i.id === id);
//       const addQty = ("qty" in item ? (item as any).qty : 1);
//       if (exists) {
//         return {
//           items: state.items.map((i) =>
//             i.id === id ? { ...i, qty: i.qty + addQty } : i
//           ),
//         };
//       }
//       const cartItem: CartItem = {
//         id: (item as any).id,
//         name: (item as any).name || (item as any).title || "Item",
//         price: (item as any).price || 0,
//         image: (item as any).image,
//         qty: addQty,
//       };
//       return { items: [...state.items, cartItem] };
//     });
//   },
//   removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
//   updateQty: (id, delta) => set((state) => ({
//   items: state.items.map((i) =>
//     i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
//   )
// })),
//   clear: () => set({ items: [] }),
//   total: () => get().items.reduce((s, it) => s + it.price * it.qty, 0),
// }));
// src/store/cartStore.ts
import { create } from "zustand";

export type CartItem = {
  id: number;
  name: string;
  title?: string;
  price: number;
  image?: string;
  qty: number;
};

type AddItemParam = Partial<CartItem> & { id: number; qty?: number; title?: string; name?: string; price?: number; image?: string };

export type CartState = {
  items: CartItem[];
  addItem: (item: AddItemParam) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, delta: number) => void; // delta: +/- 변경량
  clear: () => void;
  total: () => number;
};

export const useCart = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    set((state) => {
      const id = item.id;
      const exists = state.items.find((i) => i.id === id);
      const addQty = typeof item.qty === "number" ? item.qty : 1;
      if (exists) {
        return {
          items: state.items.map((i) => (i.id === id ? { ...i, qty: i.qty + addQty } : i)),
        };
      }
      const cartItem: CartItem = {
        id,
        name: item.name ?? item.title ?? "Item",
        title: item.name ?? item.title ?? "Item",
        price: typeof item.price === "number" ? item.price : 0,
        image: item.image,
        qty: addQty,
      };
      return { items: [...state.items, cartItem] };
    });
  },
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  updateQty: (id, delta) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)),
    })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((s, it) => s + it.price * it.qty, 0),
}));

export default useCart;
