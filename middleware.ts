import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  // 보호된 라우트: 토큰이 없으면 /login으로 리다이렉트
  if (pathname.startsWith("/main") || pathname.startsWith("/villagers")) {
    if (!accessToken) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/main/:path*", "/villagers/:path*", "/login", "/signup"],
};

