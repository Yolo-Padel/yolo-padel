import { NextRequest, NextResponse } from "next/server";
import { usersService } from "@/lib/services/users.service";
import { userDeleteSchema } from "@/lib/validations/user.validation";

export async function GET(request: NextRequest) {
  try {
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

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = userDeleteSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
        },
        { status: 400 }
      );
    }

    const result = await usersService.deleteUser(validationResult.data!);

    if (!result.success) {
      return NextResponse.json(
        result,
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message || "User deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
        { status: 500 }
      );
    }
  }