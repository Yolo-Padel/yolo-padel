import { NextRequest, NextResponse } from "next/server";
import { usersService } from "@/lib/services/users.service";
import {
  userDeleteSchema,
  userUpdateSchema,
} from "@/lib/validations/user.validation";
import { verifyAuth } from "@/lib/auth-utils";
import { createServiceContext } from "@/types/service-context";

export async function GET(request: NextRequest) {
  try {
    const tokenResult = await verifyAuth(request);

    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }
    const { user } = tokenResult;
    const serviceContext = createServiceContext(
      user.userType,
      user.userId,
      user.assignedVenueIds
    );
    const result = await usersService.getUsers(serviceContext);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = userDeleteSchema.parse(body);
    const tokenResult = await verifyAuth(request);

    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }
    const { user } = tokenResult;
    const serviceContext = createServiceContext(
      user.userType,
      user.userId,
      user.assignedVenueIds
    );
    const result = await usersService.deleteUser(validatedData, serviceContext);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("DELETE /api/users error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = userUpdateSchema.parse(body);
    const tokenResult = await verifyAuth(request);

    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }
    const { user } = tokenResult;
    const serviceContext = createServiceContext(
      user.userType,
      user.userId,
      user.assignedVenueIds
    );
    const result = await usersService.updateUser(
      validatedData as any,
      serviceContext
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data ?? null,
      message: result.message,
    });
  } catch (error) {
    console.error("PATCH /api/users error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
