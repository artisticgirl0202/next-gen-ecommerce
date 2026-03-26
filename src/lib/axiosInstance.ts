/**
 * Axios instance with security interceptors.
 *
 * Security model:
 *  - Access token is read from Zustand memory state (never localStorage).
 *  - On 401, a single /api/auth/refresh call is made (using HttpOnly cookie).
 *  - All queued requests during refresh are retried once the new token arrives.
 *  - withCredentials: true ensures the HttpOnly refresh-token cookie is sent.
 */
import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

import { getApiBaseUrl } from "@/lib/api-config";

// We import the store selector lazily inside the interceptor to avoid
// circular dependency at module initialisation time.
let _getAccessToken: (() => string | null) | null = null;
let _setAccessToken: ((token: string) => void) | null = null;
let _clearAuth: (() => void) | null = null;

export function initAxiosAuthHooks(
  getToken: () => string | null,
  setToken: (t: string) => void,
  clearAuth: () => void,
) {
  _getAccessToken = getToken;
  _setAccessToken = setToken;
  _clearAuth = clearAuth;
}

// ---------------------------------------------------------------------------
// Instance
// ---------------------------------------------------------------------------
const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // send HttpOnly refresh-token cookie automatically
});

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token
// ---------------------------------------------------------------------------
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = _getAccessToken?.();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response interceptor — silent refresh on 401
// ---------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig;
}> = [];

function processQueue(error: AxiosError | null, newToken: string | null) {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error || !newToken) {
      reject(error);
    } else {
      if (config.headers) {
        (config.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
      }
      resolve(axiosInstance(config));
    }
  });
  failedQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 on non-refresh endpoints and only once per request
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/api/auth/refresh") ||
      originalRequest.url?.includes("/api/auth/login")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axiosInstance.post<{ access_token: string }>(
        "/api/auth/refresh",
        {},
        { withCredentials: true },
      );
      const newToken = data.access_token;
      _setAccessToken?.(newToken);
      processQueue(null, newToken);

      if (originalRequest.headers) {
        (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
      }
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError, null);
      _clearAuth?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
