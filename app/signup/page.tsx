"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { handleApiError } from "@/lib/api/handleApiError";
import MusicToggleButton from "@/components/common/MusicToggleButton";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const newFieldErrors: Record<string, string> = {};

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !/^[^@]+@[^@]+\.[^@]+$/.test(trimmedEmail)) {
      newFieldErrors.email = "유효한 이메일 주소를 입력해주세요.";
    }

    if (!password || password.length < 8) {
      newFieldErrors.password = "비밀번호는 최소 8자 이상이어야 합니다.";
    }

    if (!nickname.trim()) {
      newFieldErrors.nickname = "닉네임을 입력해주세요.";
    }

    if (!confirmPassword || password !== confirmPassword) {
      newFieldErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setIsLoading(true);

    const retryAction = async () => {
      // 재시도 시 동일한 데이터로 다시 요청
      try {
        setIsLoading(true);
        setError(null);
        setFieldErrors({});

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("nickname", nickname);
        if (profileImage) {
          formData.append("profileImage", profileImage);
        }

        const response = await apiFetch<{ accessToken?: string; refreshToken?: string }>("/users/signup", {
          method: "POST",
          body: formData,
        });

        // 백엔드에서 httpOnly 쿠키로 토큰을 설정하므로 클라이언트에서 저장할 필요 없음
        // 사용자 정보만 localStorage에 저장 (UI 표시용)
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userNickname", nickname);
        if (profileImage) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            localStorage.setItem("userProfileImage", base64String);
          };
          reader.readAsDataURL(profileImage);
        }
        // 쿠키가 브라우저에 반영되도록 짧은 대기
        await new Promise(resolve => setTimeout(resolve, 200));
        // ✅ 완전한 페이지 리로드를 통해 middleware가 새로 실행되도록 함
        window.location.href = "/main";
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
      // POST /users/signup 호출 (백엔드 라우트와 일치)
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("nickname", nickname);
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await apiFetch<{ accessToken?: string; refreshToken?: string }>("/users/signup", {
          method: "POST",
          body: formData,
        });

      // 백엔드에서 httpOnly 쿠키로 토큰을 설정하므로 클라이언트에서 저장할 필요 없음
      // 사용자 정보만 localStorage에 저장 (UI 표시용)
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userNickname", nickname);
      if (profileImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          localStorage.setItem("userProfileImage", base64String);
        };
        reader.readAsDataURL(profileImage);
      }
      // 쿠키가 브라우저에 반영되도록 짧은 대기
      await new Promise(resolve => setTimeout(resolve, 200));
      // ✅ 완전한 페이지 리로드를 통해 middleware가 새로 실행되도록 함
      window.location.href = "/main";
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
          {/* 음악 토글 버튼 (카드 우측 상단) */}
          <div className="absolute top-2 right-2 z-10">
            <MusicToggleButton variant="card" />
          </div>
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
                htmlFor="nickname"
                className="block text-sm font-semibold mb-2 text-sky-600"
              >
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (fieldErrors.nickname) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.nickname;
                      return newErrors;
                    });
                  }
                }}
                required
                disabled={isLoading}
                className={`w-full px-4 py-3 border-2 rounded-xl bg-white text-zinc-800 
                          focus:outline-none focus:ring-2 focus:ring-sky-300 
                          disabled:opacity-50 disabled:cursor-not-allowed transition-all
                          ${fieldErrors.nickname ? "border-red-300 focus:border-red-300" : "border-yellow-200 focus:border-sky-300"}`}
                placeholder="닉네임을 입력하세요"
              />
              {fieldErrors.nickname && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.nickname}</p>
              )}
            </div>

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

            <div>
              <label
                htmlFor="profileImage"
                className="block text-sm font-semibold mb-2 text-sky-600"
              >
                프로필 이미지 (선택)
              </label>
              <input
                id="profileImage"
                type="file"
                accept="image/*"
                disabled={isLoading}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setProfileImage(file);
                  if (fieldErrors.profileImage) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.profileImage;
                      return newErrors;
                    });
                  }
                }}
                className="block w-full text-sm text-zinc-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-800 hover:file:bg-yellow-200 cursor-pointer"
              />
              {fieldErrors.profileImage && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.profileImage}</p>
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

