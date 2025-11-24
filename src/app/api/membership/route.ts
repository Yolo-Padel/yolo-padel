import { verifyAuth } from "@/lib/auth-utils";
import { membershipService } from "@/lib/services/membership.service";
import { createRequestContext } from "@/types/request-context";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, data: null, message: tokenResult.error },
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
    const response = await membershipService.getMemberships(requestContext);
    if (!response.success) {
      return NextResponse.json(
        { success: false, data: null, message: response.message },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      data: response.data,
      message: response.message,
    });
  } catch (error) {
    console.error("GET /api/membership error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
