/**
 * Auth store — Zustand memory-only state (NO localStorage / sessionStorage).
 *
 * Security: storing the access token in localStorage exposes it to XSS attacks.
 * By keeping it only in React memory, a compromised third-party script cannot
 * read the token even if it runs on the same page.
 *
 * The refresh token lives in an HttpOnly cookie managed entirely by the browser,
 * so JavaScript cannot touch it at all.
 */
import { create } from "zustand";

import type { AuthUser } from "@/api/auth";

// Re-export so the rest of the app can use this shape
export type { AuthUser as User };

interface AuthState {
  /** Authenticated user profile (null = logged out) */
  user: AuthUser | null;

  /** Short-lived JWT kept in memory only — never persisted */
  accessToken: string | null;

  isLoggedIn: boolean;

  /** Called after successful login / register / token refresh */
  setAuth: (user: AuthUser, token: string) => void;

  /** Called after a silent refresh that only returns a new access token */
  setAccessToken: (token: string) => void;

  /** Wipe all auth state (called on logout) */
  clearAuth: () => void;

  // ── Backward-compat helpers used by legacy code ──────────────────────────
  /** @deprecated Use setAuth instead */
  login: (user: { name: string; email: string }, remember: boolean) => void;
  logout: () => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isLoggedIn: false,
  rememberMe: false,

  setAuth: (user, token) =>
    set({ user, accessToken: token, isLoggedIn: true }),

  setAccessToken: (token) => set({ accessToken: token }),

  clearAuth: () => set({ user: null, accessToken: null, isLoggedIn: false }),

  // ── Backward-compat ───────────────────────────────────────────────────────
  setRememberMe: (val) => set({ rememberMe: val }),

  login: (legacyUser, _remember) =>
    set({
      user: {
        id: 0,
        email: legacyUser.email,
        full_name: legacyUser.name,
        is_oauth: false,
        is_verified: true,
      },
      isLoggedIn: true,
    }),

  logout: () => set({ user: null, accessToken: null, isLoggedIn: false }),
}));
