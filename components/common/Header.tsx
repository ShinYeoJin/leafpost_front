"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MusicToggleButton from "@/components/common/MusicToggleButton";

export default function Header() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleLogout = async () => {
    // 로그아웃 API 호출 (백엔드에서 httpOnly 쿠키 삭제)
    try {
      const { logout } = await import("@/lib/api/auth");
      await logout();
    } catch (err) {
      console.error("로그아웃 API 호출 실패:", err);
      // API 호출 실패해도 로컬 상태는 정리
    }
    
    // 로컬 상태 정리 (UI 표시용 데이터만)
    if (typeof window !== "undefined") {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userNickname");
      localStorage.removeItem("userProfileImage");
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

          {/* 오른쪽 영역: 모바일에서는 음악 버튼 + 햄버거, 데스크톱에서는 전체 버튼 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 항상 보이는 음악 토글 버튼 */}
            <MusicToggleButton variant="header" />

            {/* 데스크톱용 버튼들 */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={handleMyPageClick}
                className="px-4 py-2 bg-sky-100 text-sky-700 
                           rounded-lg hover:bg-sky-200 
                           transition-colors font-medium text-sm shadow-sm border border-sky-200"
              >
                마이페이지
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-400 text-white 
                           rounded-lg hover:bg-red-500 
                           transition-colors font-medium text-sm shadow-sm"
              >
                로그아웃
              </button>
            </div>

            {/* 모바일/태블릿용 햄버거 메뉴 */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="p-2 rounded-lg border border-sky-200 bg-white text-sky-700 hover:bg-sky-50 transition-colors"
                aria-label="메뉴 열기"
              >
                <span className="block w-5 h-[2px] bg-sky-600 mb-1" />
                <span className="block w-5 h-[2px] bg-sky-600 mb-1" />
                <span className="block w-5 h-[2px] bg-sky-600" />
              </button>
            </div>
          </div>
        </div>

        {/* 모바일/태블릿 드롭다운 메뉴 */}
        {isMenuOpen && (
          <div className="mt-3 md:hidden">
            <div className="bg-white border border-sky-200 rounded-lg shadow-md py-2 flex flex-col">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleMyPageClick();
                }}
                className="w-full text-left px-4 py-2 text-sm text-sky-700 hover:bg-sky-50"
              >
                마이페이지
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
              >
                로그아웃
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

