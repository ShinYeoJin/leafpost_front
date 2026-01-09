"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";

type LoginFormProps = {
  onSuccess?: (tokens: { accessToken: string; refreshToken: string }) => void;
  onError?: (error: Error) => void;
};

export default function LoginForm({ onSuccess, onError }: LoginFormProps) {
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
      const tokens = await login(email, password);
      onSuccess?.(tokens);
      
      console.log("[LoginForm] ✅ 로그인 API 성공");
      
      // ✅ 실제 인증 상태 확인: /auth/me API 호출
      // 쿠키 반영 대기 대신 실제 API로 인증 상태 확인
      console.log("[LoginForm] 인증 상태 확인 중... (/auth/me 호출)");
      const { checkAuth } = await import("@/lib/api/auth");
      const authResult = await checkAuth();
      
      if (authResult.authenticated) {
        console.log("[LoginForm] ✅ 인증 확인 성공 - /main으로 리다이렉트");
        console.log("[LoginForm] window.location.href = '/main' 실행");
        // ✅ 완전한 페이지 리로드를 통해 middleware가 새로 실행되도록 함
        // 리다이렉트 후 즉시 return하여 이후 코드 실행 방지
        window.location.href = "/main";
        return; // ✅ 리다이렉트 후 즉시 종료
      } else {
        console.error("[LoginForm] ❌ 인증 확인 실패 - 쿠키가 설정되지 않았거나 만료됨");
        const errorMessage = "로그인에 실패했습니다. 다시 시도해주세요.";
        setError(errorMessage);
        onError?.(new Error(errorMessage));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "로그인에 실패했습니다.";
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-8 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-zinc-50">
          로그인
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300"
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
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300"
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
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-medium rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}

