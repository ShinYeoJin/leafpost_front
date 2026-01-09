import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;
  
  // 모든 쿠키 확인 (디버깅용)
  const allCookies = request.cookies.getAll();
  const cookieNames = allCookies.map(c => c.name);
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // ✅ 로그인 상태 확인 (accessToken 쿠키 존재 여부)
  const isAuthenticated = !!accessToken && accessToken.length > 0;

  // ✅ 1. 로그인 페이지 접근 시 이미 로그인되어 있으면 /main으로 리다이렉트
  // 이 로직을 먼저 체크하여 로그인 상태에서 /login 접근을 차단
  if ((pathname === "/login" || pathname === "/signup" || pathname === "/auth/login" || pathname === "/auth/signup")) {
    if (isAuthenticated) {
      console.log("[Middleware] ✅ 이미 로그인됨 - /login 접근 차단, /main으로 리다이렉트", {
        pathname,
        hasAccessToken: true,
        accessTokenLength: accessToken.length,
      });
      const mainUrl = new URL("/main", request.url);
      return NextResponse.redirect(mainUrl);
    } else {
      // 로그인되지 않은 상태에서 로그인 페이지 접근은 허용
      console.log("[Middleware] 로그인 페이지 접근 허용 (비로그인 상태)");
      return NextResponse.next();
    }
  }

  // ✅ 2. 보호된 라우트 체크 - 쿠키 기반 인증 확인
  if (pathname.startsWith("/main") || pathname.startsWith("/villagers")) {
    // 디버깅: 쿠키 상태 로깅 (항상 로깅하여 문제 파악)
    console.log("[Middleware] 보호된 라우트 접근 시도:", {
      pathname,
      hasAccessToken: isAuthenticated,
      accessTokenLength: accessToken?.length || 0,
      hasRefreshToken: !!refreshToken,
      allCookieNames: cookieNames,
      cookieCount: allCookies.length,
      userAgent: request.headers.get("user-agent")?.substring(0, 50),
      referer: request.headers.get("referer") || "(직접 접근)",
    });
    
    // ✅ accessToken 쿠키가 없으면 /login으로 리다이렉트
    if (!isAuthenticated) {
      console.log("[Middleware] ❌ accessToken 쿠키 없음 - /login으로 리다이렉트");
      console.log("[Middleware] 쿠키 정보:", {
        allCookies: cookieNames,
        cookieCount: allCookies.length,
      });
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // ✅ 인증 성공 - 쿠키 확인됨
    console.log("[Middleware] ✅ 인증 확인됨 - 보호된 라우트 접근 허용", {
      pathname,
      hasAccessToken: true,
      accessTokenLength: accessToken.length,
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/main/:path*", "/villagers/:path*", "/login", "/signup"],
};

