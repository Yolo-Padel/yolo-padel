import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/lib/services/booking.service";
import { verifyAuth } from "@/lib/auth-utils";
import { UserType } from "@/types/prisma";

export async function GET(request: NextRequest) {
  try {
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, data: null, message: tokenResult.error },
        { status: 401 }
      );
    }

    if (tokenResult.user.userType !== UserType.STAFF) {
      return NextResponse.json(
        { success: false, data: null, message: "Forbidden" },
        { status: 403 }
      );
    }

    const result = await bookingService.getSuperAdminDashboardSnapshot();
    const status = result.success ? 200 : 400;

    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("Super admin dashboard API error:", error);
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
