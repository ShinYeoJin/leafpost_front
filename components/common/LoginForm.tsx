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
      
      console.log("[LoginForm] 로그인 API 응답:", {
        hasResponse: !!tokens,
        hasAccessToken: !!tokens?.accessToken,
        note: "쿠키 기반 인증이므로 response body는 선택적",
      });
      
      // ✅ 쿠키가 브라우저에 반영되도록 충분한 대기
      // sameSite: 'none' 쿠키는 크로스 도메인 설정이므로 브라우저 처리 시간이 필요함
      // login 함수 내부에서 이미 500ms 대기하므로 추가 대기
      // 크로스 도메인 쿠키는 더 많은 시간이 필요할 수 있음
      console.log("[LoginForm] 쿠키 반영 대기 중...");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log("[LoginForm] ✅ 로그인 성공 - /main으로 리다이렉트");
      console.log("[LoginForm] 참고: httpOnly 쿠키는 document.cookie에서 보이지 않지만, 브라우저는 자동으로 포함합니다.");
      
      // ✅ 완전한 페이지 리로드를 통해 middleware가 새로 실행되도록 함
      // router.push는 클라이언트 사이드 네비게이션이라 쿠키가 반영되지 않을 수 있음
      // window.location.href는 완전한 페이지 리로드이므로 쿠키가 포함됨
      // 이 시점에서 쿠키가 브라우저에 설정되어 있어야 middleware에서 확인 가능
      window.location.href = "/main";
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

