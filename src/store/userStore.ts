
// src/store/userStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OrderItem {
  productId: number;
  qty: number;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: "Processing" | "Shipped" | "Delivered";
}

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  addresses: string[];
}

interface UserState {
  profile: UserProfile;
  orders: Order[];
  addOrder: (order: Order) => void;
  addAddress: (addr: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: {
        name: "NEURAL_USER_01",
        phone: "+82 10-1234-5678",
        email: "human@nexus.io",
        addresses: ["123 Cyberpunk St, Neo Seoul"],
      },
      orders: [],
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
      addAddress: (addr) =>
        set((state) => ({
          profile: { ...state.profile, addresses: [...state.profile.addresses, addr] },
        })),
    }),
    { name: "user-storage" }
  )
);
