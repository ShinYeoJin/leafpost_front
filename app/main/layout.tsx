"use client";

type LayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: LayoutProps) {
  // 음악은 MusicPlayerProvider에서 자동으로 관리됩니다
  // 인증은 백엔드의 httpOnly 쿠키로 처리되므로 클라이언트에서 동기화할 필요 없음
  return <>{children}</>;
}

