import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Order {
  id: string;
  date: string;
  items: any[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
}

interface UserState {
  profile: {
    name: string;
    phone: string;
    email: string;
    addresses: string[];
  };
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
      addOrder: (order) => set((state) => ({
        orders: [order, ...state.orders]
      })),
      addAddress: (addr) => set((state) => ({
        profile: { ...state.profile, addresses: [...state.profile.addresses, addr] }
      })),
    }),
    { name: 'user-storage' }
  )
);
