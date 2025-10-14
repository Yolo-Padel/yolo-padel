import { NextRequest, NextResponse } from "next/server";
import { registerFormSchema } from "@/lib/validations/auth.validation";
import { authService } from "@/lib/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = registerFormSchema.safeParse(body);
    
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

    // Check if passwords match
    if (validationResult.data.password !== validationResult.data.confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Passwords do not match",
        },
        { status: 400 }
      );
    }

    // Register user
    const result = await authService.register(validationResult.data);

    if (!result.success) {
      return NextResponse.json(
        result,
        { status: 400 }
      );
    }

    // Set HTTP-only cookie
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
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Register API error:", error);
    
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
