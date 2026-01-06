// leafpost/lib/api/auth.ts
import { apiFetch } from "@/lib/api/client";

type SignupRequest = {
  email: string;
  password: string;
  name?: string;
};

type SignupResponse = {
  userId: string;
  email: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

type RefreshRequest = {
  refreshToken: string;
};

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

// 백엔드 배포 URL
export const BASE_URL = "https://leaf-post-back.onrender.com/api";

/**
 * 회원가입
 * 백엔드 라우트: POST /api/users/signup
 */
export async function signup(payload: SignupRequest): Promise<SignupResponse> {
  const response = await apiFetch<SignupResponse>("/users/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

/**
 * 로그인
 * 백엔드 라우트: POST /api/users/login
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return response.data;
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  await apiFetch("/auth/logout", { // <- /api 제거, 로그인 API처럼 일관되게
    method: "POST",
  });
}

/**
 * 토큰 갱신
 * @param refreshToken 리프레시 토큰
 */
export async function refresh(refreshToken: string): Promise<RefreshResponse> {
  const response = await apiFetch<RefreshResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  return response.data;
}

// 타입 내보내기
export type { LoginRequest, LoginResponse, RefreshRequest, RefreshResponse };
