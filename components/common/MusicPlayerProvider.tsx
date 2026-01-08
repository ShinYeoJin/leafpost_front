"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type MusicPlayerContextValue = {
  isPlaying: boolean;
  togglePlay: () => Promise<void> | void;
  currentTrack: string | null;
};

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

// 전역 음악 인스턴스 저장소
const globalAudioInstances = new Map<string, HTMLAudioElement>();

export function MusicPlayerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const previousPathnameRef = useRef<string | null>(null);

  // 페이지별 음악 설정
  const getTrackForPath = useCallback((path: string): string | null => {
    if (path === "/") {
      return "/3-01 Main Theme - Welcome Horizons.mp3";
    } else if (path === "/login" || path === "/auth/login") {
      return "/3-01 Main Theme - Welcome Horizons.mp3";
    } else if (path === "/signup" || path === "/auth/signup") {
      return "/3-01 Main Theme - Welcome Horizons.mp3";
    } else if (path.startsWith("/main")) {
      return "/1-12 Noon (~Sunny Weather~).mp3";
    }
    return null;
  }, []);

  // 모든 음악 정지
  const stopAllAudio = useCallback(() => {
    globalAudioInstances.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    setIsPlaying(false);
    setCurrentTrack(null);
  }, []);

  // 특정 트랙 재생
  const playTrack = useCallback(async (trackPath: string) => {
    if (typeof window === "undefined") return;

    // 모든 다른 음악 정지
    stopAllAudio();

    // 해당 트랙의 Audio 인스턴스 가져오기 또는 생성
    let audio = globalAudioInstances.get(trackPath);
    if (!audio) {
      audio = new Audio(trackPath);
      audio.loop = true;
      audio.volume = 0.5;
      globalAudioInstances.set(trackPath, audio);
    }

    try {
      await audio.play();
      setIsPlaying(true);
      setCurrentTrack(trackPath);
    } catch (error) {
      console.log(`[MusicPlayer] 재생 실패: ${trackPath}`, error);
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  }, [stopAllAudio]);

  // 경로 변경 시 음악 관리
  useEffect(() => {
    const track = getTrackForPath(pathname);

    // 이전 경로와 다를 때만 처리
    if (previousPathnameRef.current !== pathname) {
      if (track) {
        // 새 트랙 재생
        void playTrack(track);
      } else {
        // 음악이 없는 페이지면 모든 음악 정지
        stopAllAudio();
      }
      previousPathnameRef.current = pathname;
    }
  }, [pathname, getTrackForPath, playTrack, stopAllAudio]);

  const togglePlay = useCallback(async () => {
    if (typeof window === "undefined") return;

    const track = getTrackForPath(pathname);
    if (!track) return;

    if (isPlaying && currentTrack === track) {
      // 현재 재생 중인 트랙이면 정지
      const audio = globalAudioInstances.get(track);
      if (audio) {
        audio.pause();
        setIsPlaying(false);
      }
    } else {
      // 재생
      await playTrack(track);
    }
  }, [isPlaying, currentTrack, pathname, getTrackForPath, playTrack]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopAllAudio();
      // Audio 인스턴스는 전역적으로 유지 (페이지 이동 시에도 유지)
    };
  }, [stopAllAudio]);

  return (
    <MusicPlayerContext.Provider value={{ isPlaying, togglePlay, currentTrack }}>
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


