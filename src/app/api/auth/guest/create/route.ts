import { NextRequest, NextResponse } from "next/server";
import { guestUserService } from "@/lib/services/guest-user.service";
import { guestUserCreateSchema } from "@/lib/validations/guest-user.validation";

/**
 * POST /api/auth/guest/create
 * Create guest user and automatically generate JWT token
 * No authentication required (public endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = guestUserCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Validation failed",
          errors: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, fullName } = validationResult.data;

    // Create guest user
    const result = await guestUserService.createGuestUser(email, fullName);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: result.message,
        },
        { status: 400 }
      );
    }

    // Set HTTP-only cookie (same format as magic-link verify)
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: result.data?.user,
          profile: result.data?.profile,
        },
        message: result.message,
      },
      { status: 201 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set("auth-token", result.data?.token || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Guest user creation API error:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

