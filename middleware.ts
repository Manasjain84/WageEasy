import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ROLE_COOKIE_NAME,
  isEmployerPath,
  isWorkerPath,
} from "./lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get(ROLE_COOKIE_NAME)?.value;

  // Ignore static assets, next internal files, and api routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if accessing login/signup while already authenticated
  if (pathname === "/login" || pathname === "/signup") {
    if (roleCookie === "employer") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (roleCookie === "worker") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  // Protect Employer routes
  if (isEmployerPath(pathname)) {
    if (!roleCookie) {
      // In development / initial scaffold mode without cookie set, allow route or redirect to login
      // Uncomment the below redirect for strict auth mode:
      // return NextResponse.redirect(new URL("/login", request.url));
      return NextResponse.next();
    }
    if (roleCookie === "worker") {
      // Block worker from accessing employer routes
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  // Protect Worker routes
  if (isWorkerPath(pathname)) {
    if (!roleCookie) {
      // In development / initial scaffold mode without cookie set, allow route or redirect to login
      return NextResponse.next();
    }
    if (roleCookie === "employer") {
      // Block employer from accessing worker routes
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
