"use client";

import Image from "next/image";

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
  return (
    <div className="relative group">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-transform duration-200 hover:shadow-lg hover:scale-105">
        <div className="relative w-full aspect-square">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isPopular && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-semibold px-2 py-1 rounded-full">
              인기
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 text-center">
            {name}
          </h3>
        </div>
      </div>

      {exampleSentence && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-2 rounded-lg shadow-lg max-w-xs text-sm whitespace-normal break-words">
            <p>{exampleSentence}</p>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-zinc-900 dark:border-t-zinc-50"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

