"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pathname = usePathname();
  const hasUserInteractedRef = useRef(false);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 메인 페이지나 로그인 페이지에서만 배경음악 재생
    const shouldPlay = pathname === "/" || pathname === "/login" || pathname === "/signup";
    
    if (!shouldPlay) {
      // 다른 페이지에서는 재생하지 않음
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    // Audio 요소가 없으면 생성
    if (!audioRef.current) {
      const audio = new Audio("/3-01 Main Theme - Welcome Horizons.mp3");
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;

      // 브라우저 자동 재생 정책 우회: muted로 시작한 후 unmute
      audio.muted = true;
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`[GlobalAudio] 재생 시작 (muted): /3-01 Main Theme - Welcome Horizons.mp3`);
            // 재생 성공 후 즉시 unmute
            audio.muted = false;
            isPlayingRef.current = true;
            hasUserInteractedRef.current = true;
          })
          .catch((error) => {
            console.log(`[GlobalAudio] 자동 재생 차단됨: /3-01 Main Theme - Welcome Horizons.mp3`, error);
            // 실패 시에도 unmute 시도
            audio.muted = false;
            isPlayingRef.current = false;
          });
      } else {
        // play()가 undefined를 반환한 경우에도 unmute
        audio.muted = false;
      }

      // 사용자 인터랙션 이벤트 리스너 추가
      const handleUserInteraction = () => {
        if (!hasUserInteractedRef.current && audioRef.current && !isPlayingRef.current) {
          hasUserInteractedRef.current = true;
          audioRef.current.play()
            .then(() => {
              console.log(`[GlobalAudio] 사용자 인터랙션 후 재생 시작`);
              isPlayingRef.current = true;
            })
            .catch((error) => {
              console.log(`[GlobalAudio] 재생 실패`, error);
            });
        }
      };

      // 다양한 사용자 인터랙션 이벤트에 대해 재생 시도
      const events = ['click', 'touchstart', 'keydown'];
      events.forEach(event => {
        document.addEventListener(event, handleUserInteraction, { once: true });
      });
    } else if (audioRef.current && !isPlayingRef.current) {
      // Audio 요소가 있지만 재생 중이 아닐 때 재생 시도
      audioRef.current.play()
        .then(() => {
          isPlayingRef.current = true;
        })
        .catch(() => {
          // 재생 실패는 무시
        });
    }

    // 페이지 가시성 변경 시 재생/일시정지
    const handleVisibilityChange = () => {
      if (audioRef.current && shouldPlay) {
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

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Audio 요소는 전역적으로 유지하므로 여기서 정리하지 않음
    };
  }, [pathname]);

  // 컴포넌트 언마운트 시 Audio 정리
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return null;
}

