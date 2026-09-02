import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  ROLE_COOKIE_NAME,
  isEmployerPath,
  isWorkerPath,
} from "./lib/auth";
import { supabaseUrl, supabaseAnonKey } from "./lib/supabase";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const { pathname } = request.nextUrl;

  // Ignore static assets, next internal files, and api routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return response;
  }

  // Set up Supabase SSR server client to refresh session cookies
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Check Supabase session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const roleCookie = request.cookies.get(ROLE_COOKIE_NAME)?.value;

  // 1. Handling login/signup when already logged in
  if (pathname === "/login") {
    if (user && roleCookie === "employer") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (user && roleCookie === "worker") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return response;
  }

  // 2. Protect Employer routes
  if (isEmployerPath(pathname)) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (roleCookie === "worker") {
      // Block worker from accessing employer routes
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return response;
  }

  // 3. Protect Worker routes
  if (isWorkerPath(pathname)) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (roleCookie === "employer") {
      // Block employer from accessing worker routes
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files and favicon
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
