import { NextRequest, NextResponse } from "next/server";
import { usersService } from "@/lib/services/users.service";
import {
  userDeleteSchema,
  userUpdateSchema,
} from "@/lib/validations/user.validation";
import { verifyAuth } from "@/lib/auth-utils";
import { createRequestContext } from "@/types/request-context";
import { prisma } from "@/lib/prisma";

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

    // Get user dengan roleId untuk dynamic RBAC
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { roleRef: true },
    });

    if (!userWithRole?.roleId) {
      return NextResponse.json(
        { success: false, message: "User role not found" },
        { status: 403 }
      );
    }

    const requestContext = createRequestContext(
      userWithRole.roleId,
      user.userId,
      user.assignedVenueId
    );
    const result = await usersService.getUsers(requestContext);

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

    // Get user dengan roleId untuk dynamic RBAC
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { roleRef: true },
    });

    if (!userWithRole?.roleId) {
      return NextResponse.json(
        { success: false, message: "User role not found" },
        { status: 403 }
      );
    }

    const requestContext = createRequestContext(
      userWithRole.roleId,
      user.userId,
      user.assignedVenueId
    );
    const result = await usersService.deleteUser(validatedData, requestContext);

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

    // Get user dengan roleId untuk dynamic RBAC
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { roleRef: true },
    });

    if (!userWithRole?.roleId) {
      return NextResponse.json(
        { success: false, message: "User role not found" },
        { status: 403 }
      );
    }

    const requestContext = createRequestContext(
      userWithRole.roleId,
      user.userId,
      user.assignedVenueId
    );
    const result = await usersService.updateUser(
      validatedData as any,
      requestContext
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
