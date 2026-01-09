"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await login(email, password);
      // 백엔드에서 httpOnly 쿠키로 토큰을 설정하므로 클라이언트에서 저장할 필요 없음
      // 사용자 이메일만 localStorage에 저장 (UI 표시용)
      localStorage.setItem("userEmail", email);
      
      console.log("[LoginPage] ✅ 로그인 API 성공");
      
      // ✅ 실제 인증 상태 확인: /auth/me API 호출
      // 쿠키 반영 대기 대신 실제 API로 인증 상태 확인
      console.log("[LoginPage] 인증 상태 확인 중... (/auth/me 호출)");
      const { checkAuth } = await import("@/lib/api/auth");
      const authResult = await checkAuth();
      
      if (authResult.authenticated) {
        console.log("[LoginPage] ✅ 인증 확인 성공 - middleware가 자동으로 /main으로 리다이렉트합니다");
        // ✅ middleware가 로그인 상태를 감지하여 자동으로 /main으로 리다이렉트하도록
        // 페이지를 리로드하여 middleware가 새로 실행되도록 함
        // window.location.href 대신 window.location.reload()를 사용하여
        // 현재 페이지(/login)를 리로드하면 middleware가 로그인 상태를 확인하고 /main으로 리다이렉트
        console.log("[LoginPage] 페이지 리로드하여 middleware 실행");
        window.location.reload();
        return; // ✅ 리다이렉트 후 즉시 종료
      } else {
        console.error("[LoginPage] ❌ 인증 확인 실패 - 쿠키가 설정되지 않았거나 만료됨");
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "로그인에 실패했습니다.";
      setError(errorMessage);
      
      // 모바일 환경에서 쿠키 관련 에러인 경우 추가 안내
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile && errorMessage.includes("401") || errorMessage.includes("인증")) {
        console.warn("[Login] 모바일 환경에서 인증 실패 - 쿠키 설정 문제일 수 있습니다.");
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
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 border-4 border-yellow-100">
          {/* 제목 영역 */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔑</div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-b from-sky-400 via-sky-300 to-yellow-300 bg-clip-text text-transparent">
              로그인
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
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                placeholder="이메일을 입력하세요"
              />
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
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-gradient-to-r from-sky-400 to-sky-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl hover:from-sky-500 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

