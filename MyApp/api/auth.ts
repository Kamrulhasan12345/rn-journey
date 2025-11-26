import { apiClient } from "./client";
import type { AuthUser } from "../auth/session";
import { clearSession } from "../auth/session";

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  refreshExpiresAt?: string;
};

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { name: string; email: string; password: string };

const extractAuthResponse = (raw: any): AuthResponse => {
  const data = raw?.data ?? raw;
  return {
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    refreshExpiresAt: data.refreshExpiresAt,
  };
};

export async function login(body: LoginPayload): Promise<AuthResponse> {
  const res = await apiClient.post("/api/auth/login", body);
  return extractAuthResponse(res.data?.data ?? res.data);
}

export async function register(body: RegisterPayload): Promise<AuthResponse> {
  const res = await apiClient.post("/api/auth/register", body);
  return extractAuthResponse(res.data?.data ?? res.data);
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: string }> {
  const res = await apiClient.post("/api/auth/refresh", { refreshToken });
  const data = res.data?.data ?? res.data;
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
  };
}

export async function logout(refreshToken: string | null): Promise<void> {
  // Best-effort server logout; always clear local session immediately
  try {
    if (refreshToken) {
      await apiClient.post("/api/auth/logout", { refreshToken });
    }
  } finally {
    clearSession();
  }
}

export async function logoutAll(): Promise<void> {
  await apiClient.post("/api/auth/logout-all");
}
