import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { Role } from "./types/prisma";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "your-super-secret-jwt-key-here-make-it-long-and-random";

// Routes configuration
const PROTECTED_ROUTES = ["/admin", "/dashboard"];
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

  if (isPublicRoute) {
    if (pathname.startsWith("/auth")) {
      if (token) {
        try {
          const secret = new TextEncoder().encode(JWT_SECRET);
          const { payload } = await jwtVerify(token, secret);
          const role = (payload as any).role as string | undefined;
          const redirectTo =
            role === "USER" ? "/dashboard/booking" : "/admin/dashboard";
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
      const { payload } = await jwtVerify(token, secret);
      console.log("payload", payload);
      const role = (payload as any).role as string | undefined;

      // Role-based access control
      const isAdminRoute = pathname.startsWith("/admin");
      const isUserRoute = pathname.startsWith("/dashboard");

      // Redirect admin if trying to access user dashboard
      if (role !== Role.USER && isUserRoute) {
        const adminUrl = new URL("/admin/dashboard", request.url);
        return NextResponse.redirect(adminUrl);
      }

      // Redirect user if trying to access admin dashboard
      if (role === Role.USER && isAdminRoute) {
        const userUrl = new URL("/dashboard/booking", request.url);
        return NextResponse.redirect(userUrl);
      }
    } catch (error) {
      console.error("Token verification error:", error);
      // If token is invalid, redirect to login
      const loginUrl = new URL("/auth", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If token is valid and role matches, continue to protected route
  return NextResponse.next();
}

// Only run middleware on protected routes
export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/auth/:path*"],
};
