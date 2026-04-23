import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Keep /login route but send users straight to dashboard.
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.svg (favicon files)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
