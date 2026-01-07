"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type MusicPlayerContextValue = {
  isPlaying: boolean;
  togglePlay: () => Promise<void> | void;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = useCallback(async () => {
    if (typeof window === "undefined") return;

    // Audio 인스턴스가 없으면 생성
    if (!audioRef.current) {
      const audio = new Audio("/3-01 Main Theme - Welcome Horizons.mp3");
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log("[MusicPlayer] 재생 실패", error);
        setIsPlaying(false);
      }
    }
  }, [isPlaying]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <MusicPlayerContext.Provider value={{ isPlaying, togglePlay }}>
      {children}
    </MusicPlayerContext.Provider>
  );
}

export function useMusicPlayer() {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) {
    throw new Error("useMusicPlayer는 MusicPlayerProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
}


