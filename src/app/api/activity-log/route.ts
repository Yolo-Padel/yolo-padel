import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import { createRequestContext } from "@/types/request-context";
import { activityLogService } from "@/lib/services/activity-log.service";

export async function GET(request: NextRequest) {
  try {
    const tokenResult = await verifyAuth(request);

    if (!tokenResult?.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: tokenResult.error,
        },
        {
          status: 401,
        }
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

    const result = await activityLogService.getActivity(requestContext);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Activity logs retrieved successfully",
    });
  } catch (error) {
    console.error("GET /api/activity-log error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
