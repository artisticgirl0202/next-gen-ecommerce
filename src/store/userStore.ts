// src/store/userStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OrderItem {
  productId: number;
  qty: number;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered';
}

interface UserProfile {
  name: string;
  phone: string;
  email: string;
  addresses: string[];
}

// 개별 유저가 가지는 데이터 구조
interface UserData {
  profile: UserProfile;
  orders: Order[];
}

// 전체 스토어 상태 (모든 유저 데이터 포함)
interface UserStoreState {
  activeUserEmail: string | null; // 현재 로그인된 이메일
  users: Record<string, UserData>; // 이메일: 데이터 맵핑 (DB 역할)

  // 액션들
  login: (email: string, name?: string) => void;
  logout: () => void;

  // 현재 로그인된 유저의 데이터 조작
  getCurrentUser: () => UserData | null;
  addOrder: (order: Order) => void;
  addAddress: (addr: string) => void;
}
// --- 2. 초기값 생성기 ---
const createInitialUserData = (email: string, name: string): UserData => ({
  profile: {
    name: name,
    email: email,
    phone: '',
    addresses: [],
  },
  orders: [],
});
// --- 3. 스토어 생성 ---
export const useUserStore = create<UserStoreState>()(
  persist(
    (set, get) => ({
      activeUserEmail: null,
      users: {}, // 여기가 핵심: 모든 유저 데이터를 담는 '가짜 DB'

      // ✅ 로그인: 이메일이 처음 보이면 데이터를 새로 만들고, 있으면 기존꺼 씀
      login: (email, name = 'Unknown User') => {
        set((state) => {
          const existingUser = state.users[email];

          if (existingUser) {
            // 이미 기록이 있는 유저 -> 로그인만 시킴 (데이터 복원)
            return { activeUserEmail: email };
          } else {
            // 처음 온 유저 -> 데이터 공간 새로 생성 (초기화)
            return {
              activeUserEmail: email,
              users: {
                ...state.users,
                [email]: createInitialUserData(email, name),
              },
            };
          }
        });
      },

      logout: () => set({ activeUserEmail: null }),

      // ✅ 헬퍼: 현재 로그인된 유저 데이터 가져오기 (UI에서 쓸 때 유용)
      getCurrentUser: () => {
        const { activeUserEmail, users } = get();
        if (!activeUserEmail) return null;
        return users[activeUserEmail] || null;
      },

      // ✅ 주문 추가: '현재 로그인된 유저'의 배열에만 push
      addOrder: (order) =>
        set((state) => {
          const email = state.activeUserEmail;
          if (!email || !state.users[email]) return state; // 로그인 안했으면 무시

          return {
            users: {
              ...state.users,
              [email]: {
                ...state.users[email],
                orders: [order, ...state.users[email].orders], // 내 주문 목록에만 추가
              },
            },
          };
        }),

      // ✅ 주소 추가: '현재 로그인된 유저'의 프로필만 수정
      addAddress: (addr) =>
        set((state) => {
          const email = state.activeUserEmail;
          if (!email || !state.users[email]) return state;

          return {
            users: {
              ...state.users,
              [email]: {
                ...state.users[email],
                profile: {
                  ...state.users[email].profile,
                  addresses: [...state.users[email].profile.addresses, addr],
                },
              },
            },
          };
        }),
    }),
    {
      name: 'nexus-multi-user-storage', // ⚠️ 이름 변경 (기존 데이터와 충돌 방지)
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
