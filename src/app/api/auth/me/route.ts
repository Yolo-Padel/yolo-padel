import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "No token provided",
        },
        { status: 401 }
      );
    }

    const result = await authService.verifyToken(token);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Invalid token",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: "User authenticated",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Auth verification error:", error);
    
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