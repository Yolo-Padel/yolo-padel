import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-here-make-it-long-and-random"
);

// Routes configuration
const PROTECTED_ROUTES = ["admin/dashboard"];
const PUBLIC_ROUTES = ["/admin/auth"];

export async function middleware(request: NextRequest) {
  // Get pathname from request
  const { pathname } = request.nextUrl;
  // Get token from cookie
  const token = request.cookies.get("auth-token")?.value;

  // Check if path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Check if path is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // If path is public, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If path is protected, check for token
  if (isProtectedRoute) {
    if (!token) {
      // If no token, redirect to login
      const loginUrl = new URL("/admin/auth", request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token
      await jwtVerify(token, JWT_SECRET);
    } catch (error) {
      // If token is invalid, redirect to login
      const loginUrl = new URL("/admin/auth", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If token is valid, continue to protected route
  return NextResponse.next();
}

// Only run middleware on protected routes
export const config = {
  matcher: "/admin/:path*",
};
