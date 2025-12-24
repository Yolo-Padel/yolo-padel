import { verifyAuth } from "@/lib/auth-utils";
import { createCourtsideBooking } from "@/lib/services/courtside.service";
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

    //TODO: to call Courtside Booking Schedule to get booking id and store it to DB

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
