"use client";

import { useRouter } from "next/navigation";
import MusicToggleButton from "@/components/common/MusicToggleButton";

export default function EntryPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-sky-100 via-green-50 to-yellow-50 relative overflow-hidden">
      {/* 배경 장식 요소 */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-40 blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-green-200 rounded-full opacity-30 blur-2xl"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-200 rounded-full opacity-35 blur-lg"></div>
      
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 border-4 border-green-100 text-center transform transition-all hover:scale-105 relative">
          {/* 음악 토글 버튼 (카드 우측 상단) */}
          <div className="absolute top-3 right-3">
            <MusicToggleButton variant="card" />
          </div>
          {/* 제목 영역 */}
          <div className="mb-6">
            <div className="text-5xl mb-2">💌</div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-3 drop-shadow-sm bg-gradient-to-b from-green-400 via-green-300 to-yellow-300 bg-clip-text text-transparent">
              WELCOME TO LEAFPOST!
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-green-300 to-yellow-300 mx-auto rounded-full"></div>
          </div>
          
          {/* 설명 텍스트 */}
          <div className="text-sm sm:text-lg md:text-xl text-green-600 mb-10 leading-tight font-medium">
            <p className="animate-continuous-fade-in-up px-2">
              <span className="text-lg sm:text-2xl inline-block">🍃</span>{" "}
              <span className="whitespace-nowrap">LeafPost에 오신 것을 환영합니다!</span>{" "}
              <span className="text-lg sm:text-2xl inline-block">🍃</span>
            </p>
            <p className="text-xs sm:text-base text-green-500 mt-2 block animate-continuous-fade-in-up px-2" style={{ animationDelay: '0.3s' }}>
              친구나 주변사람들에게 내 마음을 전해보세요!
            </p>
          </div>
          
          {/* 버튼 영역 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push("/login")}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-green-100 to-green-200 text-green-900 
                       font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl
                       hover:from-green-200 hover:to-green-250 transform hover:scale-105
                       transition-all duration-200 border-2 border-green-300 active:scale-95"
            >
              <span className="mr-2">🔑</span>로그인
            </button>
            <button
              onClick={() => router.push("/signup")}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-900 
                       font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl
                       hover:from-yellow-200 hover:to-yellow-250 transform hover:scale-105
                       transition-all duration-200 border-2 border-yellow-200 active:scale-95"
            >
              <span className="mr-2">👋</span>회원가입
            </button>
          </div>
          
          {/* 하단 장식 */}
          <div className="mt-8 flex justify-center gap-2">
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0s' }}>🍑</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.2s' }}>🍎</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🍊</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.6s' }}>🍓</span>
            <span className="text-2xl animate-bounce" style={{ animationDelay: '0.8s' }}>🍒</span>
          </div>
        </div>
      </div>
    </div>
  );
}
