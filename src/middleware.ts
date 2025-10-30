import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-here-make-it-long-and-random";

// Routes configuration
const PROTECTED_ROUTES = ["/admin/dashboard"];
const PUBLIC_ROUTES = ["/auth"];

export async function middleware(request: NextRequest) {
  console.log("execute middleware");
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  console.log("execute public route");
  if (isPublicRoute) {
    console.log("isPublicRoute", pathname);
    if (pathname.startsWith("/auth")) {
      if (token) {
        try {
          const secret = new TextEncoder().encode(JWT_SECRET);
          const { payload } = await jwtVerify(token, secret);
          const role = (payload as any).role as string | undefined;
          const redirectTo = role === "USER" ? "/dashboard" : "/admin/dashboard";
          const url = new URL(redirectTo, request.url);
          return NextResponse.redirect(url);
        } catch (error) {
          // invalid token: allow access to /auth
          return NextResponse.next();
        }
      }
    }
    return NextResponse.next();
  }

  // If path is protected, check for token
  if (isProtectedRoute) {
    if (!token) {
      // If no token, redirect to login
      const loginUrl = new URL("/auth", request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token with jose (Edge compatible)
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
    } catch (error) {
      console.error("Token verification error:", error);
      // If token is invalid, redirect to login
      const loginUrl = new URL("/auth", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If token is valid, continue to protected route
  return NextResponse.next();
}

// Only run middleware on protected routes
export const config = {
  matcher: [
    "/admin/:path*",
    "/auth/:path*",
  ],
};
