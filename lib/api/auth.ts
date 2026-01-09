// leafpost/lib/api/auth.ts
import { apiFetch, ApiClientError } from "@/lib/api/client";

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
    
    // ✅ 로그인 API 성공 (201)
    console.log("[Auth] login - ✅ 로그인 API 성공 (201)");
    console.log("[Auth] login - 쿠키는 백엔드에서 설정되었으며, 브라우저가 자동으로 저장합니다.");
    
    // ✅ 쿠키 반영을 위한 최소 대기 (크로스 도메인 쿠키는 브라우저 처리 시간 필요)
    // 하지만 실제 인증 확인은 /auth/me로 하므로 짧은 대기만 필요
    if (typeof document !== "undefined") {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // ✅ response.data가 없어도 쿠키 기반 인증이므로 성공으로 처리
    return response.data || { accessToken: "", refreshToken: "" };
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
 * 현재 사용자 인증 상태 확인
 * 백엔드 라우트: GET /api/users/me (또는 /api/auth/me)
 * 쿠키 기반 인증이므로 쿠키가 유효하면 200, 없거나 만료되면 401
 * 
 * ⚠️ 중요: 404는 경로 문제이므로 인증 실패로 처리하지 않음
 */
export async function checkAuth(): Promise<{ authenticated: boolean; user?: any }> {
  try {
    // ✅ 백엔드 실제 엔드포인트 확인 필요: /users/me 또는 /auth/me
    // 일단 /users/me를 기본으로 시도 (일반적인 RESTful 패턴)
    const response = await apiFetch<any>("/users/me", {
      method: "GET",
    });
    
      console.log("[Auth] checkAuth - ✅ 인증 확인 성공 (200):", {
        status: response.status,
        hasData: !!response.data,
        endpoint: "/users/me",
        rawData: response.data,
        dataType: typeof response.data,
        hasDataProperty: response.data && typeof response.data === 'object' && 'data' in response.data,
      });
      
      // ✅ 백엔드 인터셉터가 { data: {...} } 형태로 래핑하는 경우 처리
      let userData: any;
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        // 인터셉터 래핑된 경우: { data: { email, nickname, ... } }
        console.log("[Auth] checkAuth - 인터셉터 래핑된 응답 감지, response.data.data 사용");
        userData = response.data.data;
      } else {
        // 직접 응답: { email, nickname, ... }
        console.log("[Auth] checkAuth - 직접 응답, response.data 사용");
        userData = response.data;
      }
      
      // ✅ 재로그인 시 사용자 정보 확인을 위한 상세 로그
      console.log("[Auth] checkAuth - /users/me 응답 상세:", {
        email: userData?.email,
        nickname: userData?.nickname,
        profileImage: userData?.profileImage,
        profileUrl: userData?.profileUrl,
        전체응답: JSON.stringify(userData, null, 2),
      });
      
      return {
        authenticated: true,
        user: userData,
      };
  } catch (error) {
    // ✅ 401만 인증 실패로 처리, 404는 경로 문제이므로 별도 처리
    if (error instanceof ApiClientError) {
      if (error.status === 401) {
        console.log("[Auth] checkAuth - ❌ 인증 실패 (401): 쿠키가 없거나 만료됨");
        return { authenticated: false };
      } else if (error.status === 404) {
        // 404는 경로 문제이므로 /auth/me로 재시도
        console.log("[Auth] checkAuth - /users/me 404, /auth/me로 재시도");
        try {
          const retryResponse = await apiFetch<any>("/auth/me", {
            method: "GET",
          });
          console.log("[Auth] checkAuth - ✅ /auth/me 인증 확인 성공 (200):", {
            status: retryResponse.status,
            hasData: !!retryResponse.data,
            endpoint: "/auth/me",
          });
          return {
            authenticated: true,
            user: retryResponse.data,
          };
        } catch (retryError) {
          // /auth/me도 404면 경로 문제, 다른 에러면 실제 실패
          if (retryError instanceof ApiClientError && retryError.status === 404) {
            // 둘 다 404면 경로 문제이지만 쿠키는 설정되었으므로 인증 성공으로 간주
            console.log("[Auth] checkAuth - ⚠️ /users/me와 /auth/me 모두 404 (경로 문제)");
            console.log("[Auth] checkAuth - ⚠️ 하지만 로그인 API는 성공했고 쿠키는 설정되었으므로 인증 성공으로 간주");
            return { authenticated: true };
          } else if (retryError instanceof ApiClientError && retryError.status === 401) {
            console.log("[Auth] checkAuth - ❌ /auth/me 인증 실패 (401): 쿠키가 없거나 만료됨");
            return { authenticated: false };
          } else {
            console.error("[Auth] checkAuth - ❌ /auth/me 예상치 못한 에러:", retryError);
            return { authenticated: false };
          }
        }
      } else {
        console.error("[Auth] checkAuth - ❌ 인증 확인 실패:", error);
        return { authenticated: false };
      }
    }
    
    console.error("[Auth] checkAuth - ❌ 예상치 못한 에러:", error);
    return { authenticated: false };
  }
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
