import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;

  const isPublicPath = path === "/login" || path === "/register";

  if (token) {
    if (isPublicPath) {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
    if (path === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
  }

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/tasks/:path*",
    "/insights/:path*",
    "/login",
    "/register",
  ],
};
