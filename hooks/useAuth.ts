"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * accessToken 관리 훅
 * localStorage 읽기/쓰기를 캡슐화하고 로그인 여부를 제공합니다.
 */
export function useAuth() {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드 시 localStorage에서 토큰 읽기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setAccessTokenState(token);
    }
    setIsLoading(false);
  }, []);

  // 토큰 설정
  const setToken = useCallback((token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
      setAccessTokenState(token);
    }
  }, []);

  // 토큰 제거
  const clearToken = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setAccessTokenState(null);
    }
  }, []);

  // 로그인 여부
  const isAuthenticated = accessToken !== null;

  return {
    accessToken,
    isAuthenticated,
    isLoading,
    setToken,
    clearToken,
  };
}

