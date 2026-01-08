"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * 인증 상태 관리 훅 (Deprecated)
 * 
 * ⚠️ 주의: 현재는 쿠키 기반 인증(httpOnly)을 사용하므로 이 훅은 더 이상 사용되지 않습니다.
 * 인증 상태는 백엔드의 httpOnly 쿠키로 관리되며, API 호출 시 자동으로 포함됩니다.
 * 
 * 필요시 인증 상태 확인은 보호된 API 엔드포인트를 호출하여 확인할 수 있습니다.
 */
export function useAuth() {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드 시 - 쿠키 기반 인증이므로 항상 null
  useEffect(() => {
    // httpOnly 쿠키는 JavaScript에서 접근할 수 없으므로 항상 null
    setAccessTokenState(null);
    setIsLoading(false);
  }, []);

  // 토큰 설정 - 더 이상 사용되지 않음 (쿠키 기반 인증)
  const setToken = useCallback((token: string) => {
    // 쿠키 기반 인증이므로 클라이언트에서 토큰을 설정할 수 없음
    console.warn("useAuth.setToken is deprecated. Tokens are managed via httpOnly cookies.");
  }, []);

  // 토큰 제거 - 더 이상 사용되지 않음 (쿠키 기반 인증)
  const clearToken = useCallback(() => {
    // 쿠키 기반 인증이므로 로그아웃 API를 호출해야 함
    console.warn("useAuth.clearToken is deprecated. Use logout API instead.");
    setAccessTokenState(null);
  }, []);

  // 로그인 여부 - 쿠키 기반 인증이므로 정확한 상태 확인 불가
  // 실제 인증 상태는 API 호출로 확인해야 함
  const isAuthenticated = false; // 항상 false (쿠키는 JavaScript에서 확인 불가)

  return {
    accessToken: null, // 항상 null (쿠키는 JavaScript에서 접근 불가)
    isAuthenticated,
    isLoading,
    setToken,
    clearToken,
  };
}

