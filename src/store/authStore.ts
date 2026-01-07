// import { create } from 'zustand';

// interface User {
//   name: string;
//   email: string;
// }

// interface AuthState {
//   user: User | null;
//   login: (userData: User) => void;
//   logout: () => void;
// }

// export const useAuth = create<AuthState>((set) => ({
//   user: null, // 초기값은 로그아웃 상태
//   login: (userData) => set({ user: userData }),
//   logout: () => set({ user: null }),
// }));
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  name: string;
  email: string;
  isGuest?: boolean;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  rememberMe: boolean;
  login: (user: User, remember: boolean) => void;
  logout: () => void;
  setRememberMe: (val: boolean) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      rememberMe: false,
      setRememberMe: (val) => set({ rememberMe: val }),
      login: (user, remember) => set({
        user,
        isLoggedIn: true,
        rememberMe: remember
      }),
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    {
      name: 'auth-storage',
      // rememberMe가 false일 경우 세션 종료 시 삭제하고 싶다면 조절 가능하지만,
      // 기본적으로 로컬스토리지에 저장하여 유지합니다.
    }
  )
);
