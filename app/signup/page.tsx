"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handleApiError";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    const retryAction = async () => {
      // 재시도 시 동일한 데이터로 다시 요청
      try {
        setIsLoading(true);
        setError(null);
        setFieldErrors({});
        
        const response = await apiFetch<{ accessToken?: string; refreshToken?: string }>("/auth/signup", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        if (response.data?.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
          if (response.data.refreshToken) {
            localStorage.setItem("refreshToken", response.data.refreshToken);
          }
          document.cookie = `accessToken=${response.data.accessToken}; path=/; SameSite=Strict`;
          if (response.data.refreshToken) {
            document.cookie = `refreshToken=${response.data.refreshToken}; path=/; SameSite=Strict`;
          }
          router.push("/main");
        } else {
          router.push("/login");
        }
      } catch (retryErr) {
        // 재시도 실패는 기존 에러 처리 로직과 동일하게 처리
        if (retryErr instanceof ApiClientError) {
          const errorInfo = handleApiError(retryErr);
          setError(errorInfo.userMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    try {
      // POST /auth/signup 호출 (login과 동일한 패턴)
      const response = await apiFetch<{ accessToken?: string; refreshToken?: string }>("/auth/signup", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

      // 회원가입 성공 시 accessToken 저장
      if (response.data?.accessToken) {
        // localStorage에 저장
        localStorage.setItem("accessToken", response.data.accessToken);
        if (response.data.refreshToken) {
          localStorage.setItem("refreshToken", response.data.refreshToken);
        }
        // 쿠키에 저장
        document.cookie = `accessToken=${response.data.accessToken}; path=/; SameSite=Strict`;
        if (response.data.refreshToken) {
          document.cookie = `refreshToken=${response.data.refreshToken}; path=/; SameSite=Strict`;
        }
        // /main 페이지로 자동 redirect
        router.push("/main");
      } else {
        // 토큰이 없으면 로그인 페이지로 이동
        router.push("/login");
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        const errorInfo = handleApiError(err, retryAction);
        
        // 401: 인증 오류 → Toast + /login redirect
        if (errorInfo.errorType === "auth") {
          router.push("/login");
          // Toast는 전역 시스템에서 처리 (추후 구현)
          return;
        }
        
        // 4xx: 사용자 입력 오류 → Inline 또는 Alert 표시
        if (errorInfo.errorType === "input") {
          if (err.data && typeof err.data === "object") {
            const errorData = err.data as Record<string, unknown>;
            // 필드별 에러 처리
            if (errorData.fieldErrors && typeof errorData.fieldErrors === "object") {
              const fieldErrorsData = errorData.fieldErrors as Record<string, string>;
              setFieldErrors(fieldErrorsData);
              
              // 필드별 에러가 있으면 전체 에러 메시지는 표시하지 않음
              if (Object.keys(fieldErrorsData).length > 0) {
                return;
              }
            }
          }
          // 전체 폼 에러 표시 (Alert)
          setError(errorInfo.userMessage);
        }
        // 5xx/네트워크 오류: Toast + 재시도 버튼
        else if (errorInfo.errorType === "server" || errorInfo.errorType === "network") {
          // Toast는 전역 시스템에서 처리 (추후 구현)
          // 재시도 가능한 경우 에러 메시지에 재시도 안내 포함
          setError(`${errorInfo.userMessage}${errorInfo.canRetry ? " (재시도 가능)" : ""}`);
        } else {
          // 기타 에러
          setError(errorInfo.userMessage);
        }
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "회원가입에 실패했습니다.";
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-sky-100 via-yellow-50 to-yellow-50 relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute top-10 right-10 w-24 h-24 bg-yellow-200 rounded-full opacity-40 blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-32 h-32 bg-sky-200 rounded-full opacity-30 blur-2xl"></div>
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-yellow-200 rounded-full opacity-35 blur-lg"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 border-4 border-yellow-100 relative">
          {/* 메인으로 돌아가기 버튼 (카드 내부 왼쪽 상단) */}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="absolute top-2 left-2 px-3 py-1.5 rounded-xl bg-white/90 border border-yellow-200 shadow-md text-xs sm:text-sm text-sky-600 font-semibold flex items-center gap-1 hover:bg-sky-50 hover:border-sky-200 transition-all z-10"
          >
            <span>🏠</span>
            <span>메인 페이지</span>
            <span>🏠</span>
          </button>
          {/* 제목 영역 */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">👋</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-b from-sky-400 via-sky-300 to-yellow-300 bg-clip-text text-transparent">
              회원가입
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-sky-300 to-yellow-300 mx-auto rounded-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold mb-2 text-sky-600"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.email;
                      return newErrors;
                    });
                  }
                }}
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-zinc-800 
                          focus:outline-none focus:ring-2 focus:ring-sky-300 
                          disabled:opacity-50 disabled:cursor-not-allowed transition-all
                          ${fieldErrors.email ? "border-red-300 focus:border-red-300" : "border-yellow-200 focus:border-sky-300"}`}
                placeholder="이메일을 입력하세요"
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold mb-2 text-sky-600"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.password;
                      return newErrors;
                    });
                  }
                }}
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-zinc-800 
                          focus:outline-none focus:ring-2 focus:ring-sky-300 
                          disabled:opacity-50 disabled:cursor-not-allowed transition-all
                          ${fieldErrors.password ? "border-red-300 focus:border-red-300" : "border-yellow-200 focus:border-sky-300"}`}
                placeholder="비밀번호를 입력하세요"
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold mb-2 text-sky-600"
              >
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.confirmPassword;
                      return newErrors;
                    });
                  }
                }}
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-zinc-800 
                          focus:outline-none focus:ring-2 focus:ring-sky-300 
                          disabled:opacity-50 disabled:cursor-not-allowed transition-all
                          ${fieldErrors.confirmPassword ? "border-red-300 focus:border-red-300" : "border-yellow-200 focus:border-sky-300"}`}
                placeholder="비밀번호를 다시 입력하세요"
              />
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:from-yellow-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {isLoading ? "가입 중..." : "회원가입"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

