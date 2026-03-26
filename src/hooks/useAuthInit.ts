/**
 * useAuthInit — runs once on app mount.
 *
 * Because the access token lives only in React memory it is lost on every
 * page refresh.  This hook silently attempts to get a new access token by
 * calling /api/auth/refresh, which reads the HttpOnly refresh-token cookie
 * that the browser automatically includes.
 *
 * If the cookie is absent or expired the endpoint returns 401 and the user
 * stays in the logged-out state — no redirect, no error shown.
 */
import { useEffect, useRef } from "react";

import { getMe, refreshToken } from "@/api/auth";
import { initAxiosAuthHooks } from "@/lib/axiosInstance";
import { useAuth } from "@/store/authStore";

export function useAuthInit(): void {
  const { setAuth, setAccessToken, clearAuth } = useAuth();
  const initialized = useRef(false);

  // Wire up the Axios interceptor hooks once so circular imports are avoided
  useEffect(() => {
    initAxiosAuthHooks(
      () => useAuth.getState().accessToken,
      (token) => useAuth.getState().setAccessToken(token),
      () => useAuth.getState().clearAuth(),
    );
  }, []);

  // Attempt silent session restore on first mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        const { access_token } = await refreshToken();
        setAccessToken(access_token);

        // Fetch full user profile with the new token
        const user = await getMe();
        setAuth(user, access_token);
      } catch {
        // No valid session — stay logged out silently
        clearAuth();
      }
    })();
  }, [setAuth, setAccessToken, clearAuth]);
}
