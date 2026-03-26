/**
 * Auth API — all calls go through axiosInstance so the Bearer token
 * is automatically attached and silent refresh is handled transparently.
 */
import axiosInstance from "@/lib/axiosInstance";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  is_oauth: boolean;
  is_verified: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateMePayload {
  full_name?: string;
  password?: string;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await axiosInstance.post<RegisterResponse>(
    "/api/auth/register",
    payload,
  );
  return data;
}

export async function verifyEmail(token: string): Promise<{ detail: string }> {
  const { data } = await axiosInstance.get<{ detail: string }>(
    `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
  );
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await axiosInstance.post<AuthResponse>(
    "/api/auth/login",
    payload,
  );
  return data;
}

export async function loginWithGoogle(credential: string): Promise<AuthResponse> {
  const { data } = await axiosInstance.post<AuthResponse>(
    "/api/auth/google",
    { credential },
  );
  return data;
}

/**
 * Exchange HttpOnly refresh-token cookie for a new access token.
 * withCredentials is set globally on axiosInstance.
 */
export async function refreshToken(): Promise<AuthResponse> {
  const { data } = await axiosInstance.post<AuthResponse>("/api/auth/refresh");
  return data;
}

export async function logout(): Promise<void> {
  await axiosInstance.post("/api/auth/logout");
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await axiosInstance.get<AuthUser>("/api/auth/me");
  return data;
}

export async function updateMe(payload: UpdateMePayload): Promise<AuthUser> {
  const { data } = await axiosInstance.put<AuthUser>("/api/auth/me", payload);
  return data;
}

export async function deleteMe(): Promise<void> {
  await axiosInstance.delete("/api/auth/me");
}
