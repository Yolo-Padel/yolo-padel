// src/app/api/booking/route.ts
import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/lib/services/booking.service";
import { createRequestContext } from "@/types/request-context";
import { bookingCreateSchema } from "@/lib/validations/booking.validation";
import { verifyAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const courtId = searchParams.get("courtId");
    const status = searchParams.get("status");
    const venueId = searchParams.get("venueId");
    const date = searchParams.get("date");

    let result;

    if (venueId && date) {
      // Get bookings by venue and date
      const parsedDate = new Date(date);
      result = await bookingService.getByVenueAndDate(venueId, parsedDate);
    } else if (userId) {
      result = await bookingService.getByUser(userId);
    } else if (courtId) {
      result = await bookingService.getByCourt(courtId);
    } else if (status) {
      result = await bookingService.getByStatus(status as any);
    } else {
      result = await bookingService.getAll();
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      );
    }
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = bookingCreateSchema.parse(body);
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
    const result = await bookingService.create(validatedData, requestContext);

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, message: result.message },
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
    console.error("Booking API error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}
