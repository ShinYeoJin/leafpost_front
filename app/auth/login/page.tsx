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
      // ✅ 모바일 환경 확인
      const isMobile = typeof window !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = typeof window !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isAndroid = typeof window !== "undefined" && /Android/i.test(navigator.userAgent);
      const isHTTPS = typeof window !== "undefined" ? window.location.protocol === "https:" : false;
      
      console.log("[LoginPage] 로그인 시도:", {
        email,
        isMobile,
        isIOS,
        isAndroid,
        isHTTPS,
        userAgent: typeof window !== "undefined" ? navigator.userAgent?.substring(0, 100) : "N/A",
        platform: typeof window !== "undefined" ? navigator.platform : "N/A",
      });
      
      // ✅ iOS 환경 특별 안내
      if (isIOS) {
        console.log("[LoginPage] iOS 환경 감지 - 쿠키 처리 주의:");
        console.log("[LoginPage] - iOS Safari는 ITP로 인해 쿠키가 제한될 수 있음");
        console.log("[LoginPage] - HTTPS 환경 필수:", isHTTPS);
        console.log("[LoginPage] - 로그인 후 /users/me 호출로 쿠키 포함 여부 확인");
      }
      
      const response = await login(email, password);
      // 백엔드에서 httpOnly 쿠키로 토큰을 설정하므로 클라이언트에서 저장할 필요 없음
      // 사용자 이메일만 localStorage에 저장 (UI 표시용)
      localStorage.setItem("userEmail", email);
      
      console.log("[LoginPage] ✅ 로그인 API 성공");
      
      // ✅ 실제 인증 상태 확인: /users/me API 호출
      // 쿠키 반영 대기 대신 실제 API로 인증 상태 확인
      console.log("[LoginPage] 인증 상태 확인 중... (/users/me 호출)");
      
      // ✅ iOS 환경에서는 쿠키 설정 대기 시간 추가
      if (isIOS) {
        console.log("[LoginPage] iOS 환경 - 쿠키 설정 대기 중... (3초)");
        await new Promise(resolve => setTimeout(resolve, 3000)); // iOS는 더 긴 대기 시간
        console.log("[LoginPage] iOS 환경 - 쿠키 설정 대기 완료");
      }
      
      const { checkAuth } = await import("@/lib/api/auth");
      let authResult: { authenticated: boolean; user?: any } | undefined;
      let retryCount = 0;
      const maxRetries = isIOS ? 3 : 1; // iOS는 재시도 2회 추가 (총 3회)
      
      // ✅ iOS 환경에서는 재시도 로직 추가
      while (retryCount < maxRetries) {
        try {
          console.log(`[LoginPage] 인증 확인 시도 ${retryCount + 1}/${maxRetries}`);
          authResult = await checkAuth();
          
          if (authResult && authResult.authenticated) {
            console.log(`[LoginPage] ✅ 인증 확인 성공 (시도 ${retryCount + 1}/${maxRetries})`);
            break; // 인증 성공 시 루프 종료
          } else {
            console.warn(`[LoginPage] 인증 확인 실패 (시도 ${retryCount + 1}/${maxRetries}): authenticated=false`);
          }
        } catch (err) {
          console.error(`[LoginPage] 인증 확인 에러 (시도 ${retryCount + 1}/${maxRetries}):`, err);
          
          // ✅ 401 에러인 경우 쿠키 문제로 간주
          if (err instanceof Error && err.message.includes("401")) {
            console.error("[LoginPage] 401 에러 - 쿠키가 설정되지 않았거나 만료됨");
          }
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          const waitTime = isIOS ? (retryCount + 1) * 1000 : 1000; // iOS는 점진적 대기 시간 증가
          console.log(`[LoginPage] 재시도 대기 중... (${waitTime}ms)`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      
      if (authResult && authResult.authenticated) {
        console.log("[LoginPage] ✅ 인증 확인 성공 - /main으로 리다이렉트");
        // ✅ 크로스 도메인 쿠키 문제로 middleware에서 인증 체크 불가능
        // 클라이언트에서 직접 /main으로 이동
        console.log("[LoginPage] window.location.href = '/main' 실행");
        window.location.href = "/main";
        return; // ✅ 리다이렉트 후 즉시 종료
      } else {
        console.error("[LoginPage] ❌ 인증 확인 실패 - 쿠키가 설정되지 않았거나 만료됨");
        console.error("[LoginPage] 최종 인증 결과:", {
          authResult,
          retryCount,
          maxRetries,
        });
        
        if (isMobile) {
          console.error("[LoginPage] 모바일 환경 - 추가 확인 필요:");
          console.error("[LoginPage] - HTTPS 환경:", isHTTPS);
          console.error("[LoginPage] - SameSite=None, Secure=true 쿠키는 HTTPS 환경에서만 작동합니다");
        }
        if (isIOS) {
          console.error("[LoginPage] iOS 환경 - 추가 확인 필요:");
          console.error("[LoginPage] - iOS Safari는 ITP로 인해 쿠키가 차단될 수 있음");
          console.error("[LoginPage] - 사용자가 사이트를 직접 방문한 경우에만 쿠키가 설정됨");
          console.error("[LoginPage] - 쿠키 설정 후 다음 요청에서 쿠키 포함 여부 확인 필요");
          console.error("[LoginPage] - 재시도 후에도 실패한 경우, 백엔드 쿠키 설정 확인 필요");
          console.error("[LoginPage] - iOS Safari 설정에서 쿠키 허용 여부 확인 필요");
        }
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "로그인에 실패했습니다.";
      setError(errorMessage);
      
      // 모바일 환경에서 쿠키 관련 에러인 경우 추가 안내
      const isMobile = typeof window !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = typeof window !== "undefined" && /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isHTTPS = typeof window !== "undefined" ? window.location.protocol === "https:" : false;
      
      console.error("[LoginPage] 로그인 에러:", {
        error: errorMessage,
        isMobile,
        isIOS,
        isHTTPS,
        errorType: err instanceof Error ? err.constructor.name : typeof err,
        errorStack: err instanceof Error ? err.stack?.substring(0, 200) : undefined,
      });
      
      if (isMobile && (errorMessage.includes("401") || errorMessage.includes("인증") || errorMessage.includes("load failed"))) {
        console.warn("[Login] 모바일 환경에서 인증 실패 - 쿠키 설정 문제일 수 있습니다.");
        console.warn("[Login] 확인 사항:");
        console.warn("[Login] - HTTPS 환경:", isHTTPS);
        console.warn("[Login] - credentials: 'include' 설정 확인");
        console.warn("[Login] - SameSite=None, Secure=true 쿠키는 HTTPS 환경에서만 작동합니다");
        if (isIOS) {
          console.warn("[Login] iOS 특별 안내:");
          console.warn("[Login] - iOS Safari는 ITP로 인해 쿠키가 차단될 수 있음");
          console.warn("[Login] - 사용자가 사이트를 직접 방문한 경우에만 쿠키가 설정됨");
          console.warn("[Login] - 쿠키 설정 후 다음 요청에서 쿠키 포함 여부 확인 필요");
        }
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

