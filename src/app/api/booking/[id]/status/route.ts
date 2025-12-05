import { NextRequest, NextResponse } from "next/server";
import { syncBookingStatusToOrder } from "@/lib/services/status-sync.service";
import { bookingStatusUpdateSchema } from "@/lib/validations/booking.validation";
import { bookingService } from "@/lib/services/booking.service";
import { verifyAuth } from "@/lib/auth-utils";
import { createServiceContext } from "@/types/service-context";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      console.error("Booking ID is required");
      return NextResponse.json(
        {
          success: false,
          message: "Booking ID is required",
        },
        { status: 400 }
      );
    }

    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }

    const serviceContext = createServiceContext(
      tokenResult.user.userType,
      tokenResult.user.userId,
      tokenResult.user.assignedVenueIds
    );

    const body = await request.json();
    const validation = bookingStatusUpdateSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation error:", validation.error);
      return NextResponse.json(
        { success: false, message: validation.error.message },
        { status: 400 }
      );
    }
    const { status } = validation.data;

    await bookingService.updateStatus(id, status, serviceContext);

    return NextResponse.json({
      success: true,
      message: "Booking status updated successfully",
    });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
