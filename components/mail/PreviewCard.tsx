"use client";

import { useState } from "react";

type PreviewCardProps = {
  previewImageUrl: string;
  previewText: string;
  isLoading?: boolean;
  error?: string | null;
};

/**
 * PreviewCard 컴포넌트
 * 백엔드에서 제공한 previewImageUrl과 previewText를 사용하여 미리보기 카드 렌더링
 * 카드 구조: Background (previewImageUrl) + TextSafeArea (previewText 오버레이)
 * 반응형 크기: 360x480 ~ 400x520 (모바일/웹 대응)
 */
export default function PreviewCard({
  previewImageUrl,
  previewText,
  isLoading = false,
  error = null,
}: PreviewCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  return (
    <div
      className="relative w-full max-w-[360px] sm:max-w-[380px] md:max-w-[400px] mx-auto
                 aspect-[400/520] rounded-2xl shadow-xl overflow-hidden
                 transition-all duration-300 ease-in-out
                 hover:-translate-y-2 hover:shadow-2xl
                 bg-white border-2 border-sky-100"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background Image (previewImageUrl) */}
      <div className="relative w-full h-full">
        {isLoading || imageLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-50 to-sky-100">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-sky-300 border-t-sky-500 rounded-full animate-spin" />
              <p className="text-sm font-medium text-sky-600">미리보기 생성 중...</p>
            </div>
          </div>
        ) : imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-50 to-sky-100">
            <div className="flex flex-col items-center gap-2 text-center px-4">
              <span className="text-4xl">🖼️</span>
              <p className="text-sm text-sky-600">이미지를 불러올 수 없습니다</p>
            </div>
          </div>
        ) : (
          <img
            src={previewImageUrl}
            alt="이메일 미리보기"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        {/* Gradient Overlay (하단 어둡게) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
      </div>

      {/* TextSafeArea (previewText 오버레이) */}
      {previewText && !imageError && (
        <div
          className={`absolute bottom-0 left-0 right-0
                      bg-white/95 backdrop-blur-sm
                      rounded-t-2xl p-4 sm:p-5 shadow-lg
                      border-t-2 border-sky-200
                      transition-all duration-300 ease-in-out
                      ${hovered 
                        ? 'opacity-100 scale-[1.02] shadow-xl border-sky-300' 
                        : 'opacity-95 scale-100'}`}
        >
          <p className="text-sm sm:text-base text-zinc-900 
                        leading-relaxed font-medium
                        line-clamp-3 sm:line-clamp-4">
            {previewText}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-amber-500 text-white text-sm p-3 rounded-lg shadow-xl z-50
                        animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">미리보기 오류: {error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

