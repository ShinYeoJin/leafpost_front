"use client";

import { useEffect, useRef, useState } from "react";

type AudioPlayerProps = {
  src: string;
  loop?: boolean;
  volume?: number;
  autoPlay?: boolean;
};

export default function AudioPlayer({ src, loop = true, volume = 0.5, autoPlay = true }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasUserInteractedRef = useRef(false);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Audio 요소 생성
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    audioRef.current = audio;

    // 자동 재생 시도
    if (autoPlay) {
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`[Audio] 재생 시작: ${src}`);
            isPlayingRef.current = true;
          })
          .catch((error) => {
            // 브라우저 정책으로 인한 자동 재생 차단 시 사용자 인터랙션 대기
            console.log(`[Audio] 자동 재생 차단됨: ${src}`, error);
            isPlayingRef.current = false;
          });
      }
    }

    // 사용자 인터랙션 이벤트 리스너 추가
    const handleUserInteraction = () => {
      if (!hasUserInteractedRef.current && audioRef.current && !isPlayingRef.current) {
        hasUserInteractedRef.current = true;
        audioRef.current.play()
          .then(() => {
            console.log(`[Audio] 사용자 인터랙션 후 재생 시작: ${src}`);
            isPlayingRef.current = true;
          })
          .catch((error) => {
            console.log(`[Audio] 재생 실패: ${src}`, error);
          });
      }
    };

    // 다양한 사용자 인터랙션 이벤트에 대해 재생 시도
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true });
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [src, loop, volume, autoPlay]);

  // 페이지 가시성 변경 시 재생/일시정지
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (audioRef.current) {
        if (document.hidden) {
          audioRef.current.pause();
        } else if (isPlayingRef.current || hasUserInteractedRef.current) {
          audioRef.current.play().catch(() => {
            // 자동 재생 실패는 무시
          });
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null; // Audio 요소는 직접 렌더링하지 않음
}

