import { verifyAuth } from "@/lib/auth-utils";
import { getCourtsideBookingsByVenue } from "@/lib/services/courtside.service";
import { getCourtsideBookingsByVenueSchema } from "@/lib/validations/courtside.validation";
import { createServiceContext } from "@/types/service-context";
import { prisma } from "@/lib/prisma";
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

    const parsed = getCourtsideBookingsByVenueSchema.safeParse(body);

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

    // Fetch venue with courtsideApiKey
    const venue = await prisma.venue.findUnique({
      where: { id: parsed.data.venueId },
      select: { courtsideApiKey: true },
    });

    if (!venue?.courtsideApiKey) {
      // No courtside integration for this venue, return empty array
      return NextResponse.json(
        {
          success: true,
          data: [],
        },
        { status: 200 },
      );
    }

    // Fetch all courts with courtsideCourtId for this venue
    const courts = await prisma.court.findMany({
      where: {
        venueId: parsed.data.venueId,
        isArchived: false,
        courtsideCourtId: { not: null },
      },
      select: { id: true, courtsideCourtId: true },
    });

    if (courts.length === 0) {
      // No courts with courtside integration
      return NextResponse.json(
        {
          success: true,
          data: [],
        },
        { status: 200 },
      );
    }

    const result = await getCourtsideBookingsByVenue(
      {
        apiKey: venue.courtsideApiKey,
        bookingDate: parsed.data.bookingDate,
        courts: courts.map((c) => ({
          courtId: c.id,
          courtsideCourtId: c.courtsideCourtId!,
        })),
      },
      context,
    );

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
