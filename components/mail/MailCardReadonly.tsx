"use client";

import { useState } from "react";
import Image from "next/image";

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
      className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto
                 rounded-2xl shadow-lg overflow-hidden 
                 transition-all duration-300 ease-in-out
                 hover:-translate-y-2 hover:shadow-2xl
                 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800
                 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Background backgroundUrl={backgroundUrl} hovered={hovered} />
      <VillagerSticker 
        villagerStickerUrl={villagerStickerUrl} 
        villagerName={villagerName}
        hovered={hovered}
      />
      <SpeechBubble text={speechBubbleText} hovered={hovered} />
      {textSafeAreaContent && (
        <TextSafeArea content={textSafeAreaContent} hovered={hovered} />
      )}
      <StatusBadge 
        status={status} 
        scheduledDate={scheduledDate} 
        sentDate={sentDate}
        hovered={hovered}
      />
    </div>
  );
}

/* Background */
type BackgroundProps = { 
  backgroundUrl?: string;
  hovered: boolean;
};
function Background({ backgroundUrl, hovered }: BackgroundProps) {
  return (
    <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 overflow-hidden rounded-t-2xl">
      {backgroundUrl ? (
        <Image 
          src={backgroundUrl} 
          alt="Background" 
          fill 
          className={`object-cover transition-all duration-500 ease-in-out
                     ${hovered ? 'scale-110 opacity-90' : 'scale-100 opacity-100'}`}
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 
                        dark:from-zinc-800 dark:to-zinc-900
                        transition-opacity duration-300
                        ${hovered ? 'opacity-80' : 'opacity-100'}`} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent 
                      dark:from-black/50 transition-opacity duration-300
                      ${hovered ? 'opacity-100' : 'opacity-80'}" />
    </div>
  );
}

/* VillagerSticker */
type VillagerStickerProps = { 
  villagerStickerUrl: string; 
  villagerName: string;
  hovered: boolean;
};
function VillagerSticker({ villagerStickerUrl, villagerName, hovered }: VillagerStickerProps) {
  return (
    <div className={`absolute top-4 left-4 transition-all duration-300 ease-in-out
                    ${hovered ? 'scale-110 translate-y-[-4px]' : 'scale-100'}`}>
      <div className="relative drop-shadow-xl">
        <Image
          src={villagerStickerUrl}
          alt={villagerName}
          width={100}
          height={100}
          className="object-contain rounded-full transition-opacity duration-300
                     border-2 border-white/50 dark:border-zinc-700/50
                     ${hovered ? 'opacity-100' : 'opacity-90'}"
        />
      </div>
    </div>
  );
}

/* SpeechBubble */
type SpeechBubbleProps = { text: string; hovered: boolean };
function SpeechBubble({ text, hovered }: SpeechBubbleProps) {
  return (
    <div
      className={`absolute top-24 sm:top-28 md:top-32 left-4 right-4 
                  bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm
                  rounded-xl shadow-lg p-4 sm:p-5 
                  border border-zinc-200 dark:border-zinc-700
                  transition-all duration-300 ease-in-out
                  ${hovered 
                    ? 'opacity-100 scale-[1.02] shadow-xl border-zinc-300 dark:border-zinc-600' 
                    : 'opacity-85 scale-100'}`}
    >
      <p className="text-sm sm:text-base text-zinc-900 dark:text-zinc-50 
                    leading-relaxed font-medium">
        {text}
      </p>
    </div>
  );
}

/* TextSafeArea */
type TextSafeAreaProps = { 
  content: string;
  hovered: boolean;
};
function TextSafeArea({ content, hovered }: TextSafeAreaProps) {
  return (
    <div className={`absolute bottom-20 sm:bottom-24 left-4 right-4 
                    bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm
                    rounded-xl p-4 sm:p-5 shadow-lg
                    border border-zinc-200 dark:border-zinc-700
                    transition-all duration-300 ease-in-out
                    ${hovered 
                      ? 'opacity-100 scale-[1.02] shadow-xl border-zinc-300 dark:border-zinc-600' 
                      : 'opacity-90 scale-100'}`}>
      <p className="text-sm sm:text-base font-semibold 
                    text-zinc-900 dark:text-zinc-50 
                    line-clamp-2">
        {content}
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
    <div className={`absolute top-4 right-4 z-10
                    transition-all duration-300 ease-in-out
                    ${hovered ? 'scale-110' : 'scale-100'}`}>
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                   text-xs font-bold shadow-lg backdrop-blur-sm
                   transition-all duration-300
                   ${
                     isSent
                       ? "bg-green-500/95 dark:bg-green-600/95 text-white border border-green-400/50 dark:border-green-500/50"
                       : "bg-amber-500/95 dark:bg-amber-600/95 text-white border border-amber-400/50 dark:border-amber-500/50"
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
