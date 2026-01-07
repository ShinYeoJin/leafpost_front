"use client";

import { useEffect } from "react";
import AudioPlayer from "@/components/common/AudioPlayer";

type LayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: LayoutProps) {
  // localStorage의 accessToken을 쿠키와 동기화
  useEffect(() => {
    if (typeof window !== "undefined") {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        // 쿠키에 accessToken이 없으면 localStorage에서 동기화
        const cookieToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("accessToken="))
          ?.split("=")[1];
        
        if (!cookieToken) {
          document.cookie = `accessToken=${accessToken}; path=/; SameSite=Strict`;
        }
      }
    }
  }, []);

  return (
    <>
      <AudioPlayer src="/1-12 Noon (~Sunny Weather~).mp3" loop={true} volume={0.5} />
      {children}
    </>
  );
}

