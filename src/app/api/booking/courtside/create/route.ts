import { verifyAuth } from "@/lib/auth-utils";
import { bookingService } from "@/lib/services/booking.service";
import {
  createCourtsideBooking,
  getCourtsideBooking,
} from "@/lib/services/courtside.service";
import { createCourtsideBookingSchema } from "@/lib/validations/courtside.validation";
import { createServiceContext } from "@/types/service-context";
import { NextRequest, NextResponse } from "next/server";

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
        { status: 401 },
      );
    }

    const { user } = tokenResult;

    const context = createServiceContext(
      user.userType,
      user.userId,
      user.assignedVenueIds,
    );

    const body = await request.json();

    const parsed = createCourtsideBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Invalid request body",
          error: parsed.error,
        },
        { status: 400 },
      );
    }

    const result = await createCourtsideBooking(parsed.data, context);
    if (!result.status) {
      return NextResponse.json(
        {
          success: false,
          data: result.data,
          message: result.message,
        },
        { status: 400 },
      );
    }

    const bookingResult = await getCourtsideBooking(
      {
        apiKey: parsed.data.apiKey,
        bookingDate: parsed.data.date,
        courtsideCourtId: parsed.data.court_id,
      },
      context,
    );

    // Find the booking by start_hours and store the courtside booking ID
    if (bookingResult && Array.isArray(bookingResult)) {
      // Convert start_hours from "HH.mm" to "HH:mm" format for comparison
      const normalizedStartHours = parsed.data.start_hours.replace(".", ":");
      const matchingBooking = bookingResult.find(
        (booking) =>
          booking.booking.timeSlots[0]?.openHour === normalizedStartHours,
      );

      if (matchingBooking) {
        await bookingService.storeCourtsideBookingId(
          parsed.data.createdInternalBookingId,
          matchingBooking.bookingId,
          context,
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: result.message,
      },
      { status: 201 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
