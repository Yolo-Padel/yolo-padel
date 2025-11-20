import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/lib/services/booking.service";
import { verifyAuth } from "@/lib/auth-utils";
import { createServiceContext } from "@/types/service-context";

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
    const context = createServiceContext(
      user.role,
      user.userId,
      user.assignedVenueId
    );

    const result = await bookingService.getAdminDashboardSnapshot(context);
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

