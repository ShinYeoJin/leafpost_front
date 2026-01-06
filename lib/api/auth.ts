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
 * @param email 사용자 이메일
 * @param password 비밀번호
 * @param name 사용자 이름
 */
export async function signup(payload: SignupRequest): Promise<SignupResponse> {
  const response = await apiFetch<SignupResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

/**
 * 로그인
 * @param email 이메일
 * @param password 비밀번호
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await apiFetch<LoginResponse>("/auth/login", {
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
