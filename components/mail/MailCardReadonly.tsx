"use client";

import { useState } from "react";

type MailCardReadonlyProps = {
  backgroundUrl?: string;
  villagerStickerUrl: string;
  villagerName: string;
  speechBubbleText: string;
  textSafeAreaContent?: string;
  status: "reserved" | "sent";
  scheduledDate?: string;
  sentDate?: string;
};

export default function MailCardReadonly({
  backgroundUrl,
  villagerStickerUrl,
  villagerName,
  speechBubbleText,
  textSafeAreaContent,
  status,
  scheduledDate,
  sentDate,
}: MailCardReadonlyProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative w-full max-w-full sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto
                 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden 
                 transition-all duration-300 ease-in-out
                 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-2xl
                 bg-white border-2 border-sky-100
                 group flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 카드 상단 헤더 영역 */}
      <div className="relative bg-gradient-to-br from-white via-sky-50 to-sky-100 px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {/* 주민 프로필 이미지와 이름 (좌측 또는 중앙) */}
        <div className="flex justify-center sm:justify-start">
          <VillagerHeaderImage 
            villagerStickerUrl={villagerStickerUrl} 
            villagerName={villagerName}
            hovered={hovered}
          />
        </div>
        
        {/* 상태 배지 (우측 상단) */}
        <StatusBadge 
          status={status} 
          scheduledDate={scheduledDate} 
          sentDate={sentDate}
          hovered={hovered}
        />
      </div>

      {/* 카드 하단 콘텐츠 영역 */}
      <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 md:p-5 bg-white">
        {/* 제목 영역 */}
        {textSafeAreaContent && (
          <div className="relative">
            <div className="mb-1.5 sm:mb-2">
              <span className="text-xs font-semibold text-sky-600 uppercase tracking-wide">제목</span>
            </div>
            <div className="bg-sky-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm border-2 border-sky-200">
              <p className="text-xs sm:text-sm md:text-base font-bold text-zinc-900 line-clamp-2 break-words">
                {textSafeAreaContent}
              </p>
            </div>
          </div>
        )}

        {/* 내용 영역 */}
        <div className="relative">
          <div className="mb-1.5 sm:mb-2">
            <span className="text-xs font-semibold text-sky-600 uppercase tracking-wide">내용</span>
          </div>
          <div className="bg-sky-50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 shadow-sm border-2 border-sky-200">
            <p className="text-xs sm:text-sm md:text-base text-zinc-900 leading-relaxed break-words">
              {speechBubbleText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* VillagerHeaderImage - 카드 상단 헤더에 배치되는 주민 프로필 이미지와 이름 */
type VillagerHeaderImageProps = { 
  villagerStickerUrl: string; 
  villagerName: string;
  hovered: boolean;
};
function VillagerHeaderImage({ villagerStickerUrl, villagerName, hovered }: VillagerHeaderImageProps) {
  // villagerStickerUrl이 없거나 빈 문자열인 경우 placeholder 표시
  if (!villagerStickerUrl || villagerStickerUrl.trim() === "") {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className={`relative transition-all duration-300 ease-in-out
                        ${hovered ? 'scale-110' : 'scale-100'}`}>
          <div className="relative drop-shadow-xl w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-white flex items-center justify-center border-4 border-sky-200 shadow-lg">
            <span className="text-3xl sm:text-4xl md:text-5xl">👤</span>
          </div>
        </div>
        {/* 주민 이름 (항상 표시) */}
        <p className="text-xs sm:text-sm text-sky-700 font-medium text-center max-w-[120px] sm:max-w-[140px] md:max-w-[160px] truncate">
          {villagerName}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative transition-all duration-300 ease-in-out
                      ${hovered ? 'scale-110' : 'scale-100'}`}>
        <div className="relative drop-shadow-xl w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
          <img
            src={villagerStickerUrl}
            alt={villagerName}
            className="w-full h-full object-contain"
            style={{ objectPosition: 'center' }}
          />
        </div>
      </div>
      {/* 주민 이름 (항상 표시) */}
      <p className="text-xs sm:text-sm text-sky-700 font-medium text-center max-w-[120px] sm:max-w-[140px] md:max-w-[160px] truncate">
        {villagerName}
      </p>
    </div>
  );
}

/* StatusBadge */
type StatusBadgeProps = {
  status: "reserved" | "sent";
  scheduledDate?: string;
  sentDate?: string;
  hovered: boolean;
};
function StatusBadge({ status, scheduledDate, sentDate, hovered }: StatusBadgeProps) {
  const isSent = status === "sent";
  const label = isSent ? "전송됨" : "예약됨";
  const dateText =
    isSent && sentDate
      ? new Date(sentDate).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        })
      : !isSent && scheduledDate
      ? new Date(scheduledDate).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        })
      : "";

  return (
    <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 z-10
                    transition-all duration-300 ease-in-out
                    ${hovered ? 'scale-110' : 'scale-100'}`}>
      <div
        className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full 
                   text-[10px] sm:text-xs font-bold shadow-lg backdrop-blur-sm
                   transition-all duration-300
                   ${
                     isSent
                       ? "bg-green-400 text-white border-2 border-green-300"
                       : "bg-yellow-400 text-white border-2 border-yellow-300"
                   }
                   ${hovered ? "shadow-xl opacity-100" : "opacity-95"}`}
      >
        <span className="flex items-center gap-1.5">
          {isSent ? (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span>{label}</span>
        </span>
        {dateText && (
          <span className="text-[10px] font-medium opacity-90 pl-1 border-l border-white/30">
            {dateText}
          </span>
        )}
      </div>
    </div>
  );
}
