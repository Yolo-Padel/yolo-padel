import { NextRequest, NextResponse } from "next/server";
import { usersService } from "@/lib/services/users.service";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies
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

    // Verify token and get user ID
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
    
    // Check if user is admin
    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Unauthorized - Admin access required",
        },
        { status: 403 }
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
