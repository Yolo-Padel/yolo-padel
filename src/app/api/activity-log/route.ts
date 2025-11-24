import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth-utils";
import {
  createServiceContext,
  requirePermission,
} from "@/types/service-context";
import { UserType } from "@/types/prisma";
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
    const serviceContext = createServiceContext(
      user.userType,
      user.userId,
      user.assignedVenueId
    );

    const accessError = requirePermission(serviceContext, UserType.STAFF);
    if (accessError) {
      return NextResponse.json(
        {
          success: false,
          message: accessError.message,
        },
        {
          status: 403,
        }
      );
    }

    const result = await activityLogService.getActivity(serviceContext);
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
