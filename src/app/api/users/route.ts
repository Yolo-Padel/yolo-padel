import { NextRequest, NextResponse } from "next/server";
import { usersService } from "@/lib/services/users.service";
import { verifyAdminAuth } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const { isValid, user, error } = await verifyAdminAuth(request);

    if (!isValid || !user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: error || "Unauthorized",
        },
        { status: user?.role !== "ADMIN" ? 403 : 401 }
      );
    }

    const result = await usersService.getUsers();

    if (!result.success) {
      return NextResponse.json(
        result,
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: result.message,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Users API error:", error);
    
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
