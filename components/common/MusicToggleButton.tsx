"use client";

import { useMusicPlayer } from "./MusicPlayerProvider";

type MusicToggleButtonProps = {
  variant?: "header" | "card";
  className?: string;
};

export default function MusicToggleButton({
  variant = "header",
  className = "",
}: MusicToggleButtonProps) {
  const { isPlaying, togglePlay } = useMusicPlayer();

  const handleClick = () => {
    // 사용자 클릭 이벤트에서만 play/pause 호출
    void togglePlay();
  };

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={isPlaying ? "배경 음악 정지" : "배경 음악 재생"}
        className={`inline-flex items-center justify-center rounded-full border border-sky-200 bg-white/90 text-sky-700 
                    hover:bg-sky-50 hover:border-sky-300 shadow-sm px-2 py-1 text-xs sm:text-sm ${className}`}
      >
        <span className="mr-1">{isPlaying ? "🔇" : "🔊"}</span>
        <span className="hidden sm:inline">{isPlaying ? "정지" : "재생"}</span>
      </button>
    );
  }

  // header variant
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`px-3 py-2 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 
                  border border-sky-200 shadow-sm text-xs sm:text-sm font-medium flex items-center gap-1 ${className}`}
    >
      <span>{isPlaying ? "🔇" : "🔊"}</span>
      <span>{isPlaying ? "정지" : "재생"}</span>
    </button>
  );
}


