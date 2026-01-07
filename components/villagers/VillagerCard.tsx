"use client";

import { useState } from "react";

type VillagerCardProps = {
  name: string;
  imageUrl: string;
  isPopular: boolean;
  exampleSentence: string;
};

export default function VillagerCard({
  name,
  imageUrl,
  isPopular,
  exampleSentence,
}: VillagerCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative group h-full">
      <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-sky-100 transition-transform duration-200 hover:shadow-lg hover:scale-105 h-full flex flex-col">
        <div className="relative w-full pt-3 px-3">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-32 sm:h-36 md:h-40 object-contain mx-auto"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sky-400">
              <span className="text-3xl sm:text-4xl">🐾</span>
            </div>
          )}
          {isPopular && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
              인기
            </div>
          )}
        </div>
        <div className="px-3 pb-3 pt-2 flex-1 flex items-center justify-center">
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-zinc-900 text-center break-words line-clamp-1">
            {name}
          </h3>
        </div>
      </div>

      {/* 카드 안에서 말투 예시 표시 */}
      {exampleSentence && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-lg flex items-center justify-center z-10">
          <div className="bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-xl max-w-[90%] mx-2 sm:mx-4">
            <p className="text-xs sm:text-sm text-zinc-900 whitespace-normal break-words text-center">
              {exampleSentence}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

