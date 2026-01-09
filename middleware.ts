import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  
  // 모든 쿠키 확인 (디버깅용)
  const allCookies = request.cookies.getAll();
  const cookieNames = allCookies.map(c => c.name);

  // 보호된 라우트 체크
  if (pathname.startsWith("/main") || pathname.startsWith("/villagers")) {
    // 디버깅: 쿠키 상태 로깅 (개발 환경에서만)
    if (process.env.NODE_ENV === "development" || !accessToken) {
      console.log("[Middleware] 보호된 라우트 접근 시도:", {
        pathname,
        hasAccessToken: !!accessToken,
        accessTokenLength: accessToken?.length || 0,
        allCookieNames: cookieNames,
        userAgent: request.headers.get("user-agent")?.substring(0, 50),
      });
    }
    
    if (!accessToken) {
      console.log("[Middleware] ❌ accessToken 쿠키 없음 - /login으로 리다이렉트");
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // 디버깅: 인증 성공 로그
    if (process.env.NODE_ENV === "development") {
      console.log("[Middleware] ✅ 인증 확인됨 - 보호된 라우트 접근 허용");
    }
  }

  // /login, /signup 접근 시 이미 로그인되어 있으면 /main으로 리다이렉트
  if ((pathname === "/login" || pathname === "/signup" || pathname === "/auth/login" || pathname === "/auth/signup") && accessToken) {
    console.log("[Middleware] 이미 로그인됨 - /main으로 리다이렉트");
    const mainUrl = new URL("/main", request.url);
    return NextResponse.redirect(mainUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/main/:path*", "/villagers/:path*", "/login", "/signup"],
};

