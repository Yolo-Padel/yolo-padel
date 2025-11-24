import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/lib/services/booking.service";
import { verifyAuth } from "@/lib/auth-utils";
import { createRequestContext } from "@/types/request-context";
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

    const result =
      await bookingService.getAdminDashboardSnapshot(requestContext);
    const status = result.success ? 200 : 400;

    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("Admin dashboard API error:", error);
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
