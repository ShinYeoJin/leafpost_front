"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MusicToggleButton from "@/components/common/MusicToggleButton";

export default function Header() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // localStorage에서 사용자 정보 가져오기 (Mock 환경)
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("userEmail");
      setUserEmail(storedEmail);
    }
  }, []);

  const handleLogoClick = () => {
    // 현재 경로가 /main이 아닐 때만 이동
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath !== "/main") {
        router.push("/main");
      } else {
        // 이미 /main에 있으면 페이지 새로고침
        window.location.reload();
      }
    }
  };

  const handleMyPageClick = () => {
    router.push("/main/mypage");
  };

  const handleLogout = () => {
    // localStorage와 쿠키에서 토큰 제거
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userEmail");
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b-2 border-sky-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">💌</span>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-yellow-400 bg-clip-text text-transparent">
              LeafPost
            </span>
          </button>

          {/* 오른쪽 버튼들 */}
          <div className="flex items-center gap-3">
            {/* 마이페이지 버튼 */}
            <button
              onClick={handleMyPageClick}
              className="px-4 py-2 bg-sky-100 text-sky-700 
                         rounded-lg hover:bg-sky-200 
                         transition-colors font-medium text-sm shadow-sm border border-sky-200"
            >
              마이페이지
            </button>

            {/* 로그아웃 버튼 */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-400 text-white 
                         rounded-lg hover:bg-red-500 
                         transition-colors font-medium text-sm shadow-sm"
            >
              로그아웃
            </button>

            {/* 음악 토글 버튼 */}
            <MusicToggleButton variant="header" />
          </div>
        </div>
      </div>
    </header>
  );
}

