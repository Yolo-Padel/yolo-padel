import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { manualBookingSchema } from "@/lib/validations/manual-booking.validation";
import { manualBookingService } from "@/lib/services/manual-booking.service";
import { createServiceContext } from "@/types/service-context";

export async function POST(request: NextRequest) {
  try {
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: tokenResult.error,
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = manualBookingSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message || "Invalid input validation";
      return NextResponse.json(
        {
          success: false,
          data: null,
          message,
          errors: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { user } = tokenResult;
    const context = createServiceContext(
      user.userType,
      user.userId,
      user.assignedVenueIds
    );

    const result = await manualBookingService.create(parsed.data, context);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          data: result.data,
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: result.message,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Manual booking API error:", error);
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
