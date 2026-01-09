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
 * 개발 환경용 Mock Login
 * CORS 문제로 인한 로컬 개발 환경에서만 사용
 */
function mockLogin(email: string, password: string): Promise<LoginResponse> {
  // 가짜 토큰 생성 (JWT 형식처럼 보이도록)
  const mockAccessToken = `mock.access.token.${btoa(email).slice(0, 20)}.${Date.now()}`;
  const mockRefreshToken = `mock.refresh.token.${btoa(email).slice(0, 20)}.${Date.now()}`;
  
  return Promise.resolve({
    accessToken: mockAccessToken,
    refreshToken: mockRefreshToken,
  });
}

/**
 * 로그인
 * 백엔드 라우트: POST /api/auth/login
 * 개발 환경에서는 Mock Login 사용 (CORS 문제 해결)
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  // 개발 환경에서만 Mock Login 사용
  if (process.env.NODE_ENV === "development") {
    console.log("[DEV] Mock Login 사용 중 - 실제 API 호출하지 않음");
    return mockLogin(email, password);
  }
  
  // Production 환경에서는 실제 API 호출
  console.log("[Auth] login - 로그인 API 호출 시작");
  console.log("[Auth] login - 요청 URL:", `${process.env.NEXT_PUBLIC_API_BASE_URL || BASE_URL}/auth/login`);
  console.log("[Auth] login - credentials: include 사용");
  
  try {
    const response = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    
    // 모바일 환경에서 쿠키 설정 확인을 위한 디버깅
    console.log("[Auth] login - 응답 성공:", {
      status: response.status,
      statusText: response.statusText,
      hasData: !!response.data,
    });
    
    // 쿠키 확인 (document.cookie는 httpOnly 쿠키는 보이지 않지만, 디버깅용)
    if (typeof document !== "undefined") {
      console.log("[Auth] login - 현재 document.cookie:", document.cookie || "(쿠키 없음)");
      console.log("[Auth] login - 참고: httpOnly 쿠키는 document.cookie에서 보이지 않습니다.");
      
      // 쿠키가 설정되기를 기다림 (sameSite: 'none' 쿠키는 비동기적으로 설정될 수 있음)
      // 브라우저가 Set-Cookie 헤더를 처리하는 시간을 확보
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("[Auth] login - 쿠키 설정 대기 완료");
    }
    
    return response.data;
  } catch (error) {
    console.error("[Auth] login - 로그인 실패:", error);
    throw error;
  }
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
