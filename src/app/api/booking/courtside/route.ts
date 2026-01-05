import { verifyAuth } from "@/lib/auth-utils";
import { getCourtsideBooking } from "@/lib/services/courtside.service";
import { getCourtsideBookingsSchema } from "@/lib/validations/courtside.validation";
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

    const parsed = getCourtsideBookingsSchema.safeParse(body);

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

    const result = await getCourtsideBooking(parsed.data, context);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 },
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
