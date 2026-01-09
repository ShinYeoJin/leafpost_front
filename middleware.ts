import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ⚠️ 중요: 크로스 도메인 쿠키 문제로 인해 middleware에서 쿠키 기반 인증 판별 불가능
  // 백엔드 도메인(leaf-post-back.onrender.com)에서 설정한 쿠키는
  // 프론트 도메인(leafpost-front-final.vercel.app)의 middleware에서 읽을 수 없음
  // 따라서 middleware에서는 접근 제어를 하지 않고, 클라이언트에서 인증 상태를 확인하도록 함
  
  // ✅ middleware는 최소한의 로직만 수행
  // 실제 인증 확인은 각 페이지의 클라이언트 컴포넌트에서 /users/me API 호출로 처리
  
  console.log("[Middleware] 요청 처리:", {
    pathname,
    note: "크로스 도메인 쿠키 문제로 middleware에서 인증 체크하지 않음",
  });

  return NextResponse.next();
}

export const config = {
  matcher: ["/main/:path*", "/villagers/:path*", "/login", "/signup"],
};

