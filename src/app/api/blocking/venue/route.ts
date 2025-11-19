import { NextRequest, NextResponse } from "next/server";
import { getActiveBlockingsByVenueAndDate } from "@/lib/services/blocking.service";

/**
 * GET /api/blocking/venue
 * Get active blockings for all courts in a venue for specific date
 * Query params:
 * - venueId: string (required)
 * - date: string (ISO date, required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");
    const dateStr = searchParams.get("date");

    // Validation
    if (!venueId) {
      return NextResponse.json(
        {
          success: false,
          message: "Venue ID is required",
        },
        { status: 400 }
      );
    }

    if (!dateStr) {
      return NextResponse.json(
        {
          success: false,
          message: "Date is required",
        },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date format",
        },
        { status: 400 }
      );
    }

    // Get active blockings for venue
    const blockings = await getActiveBlockingsByVenueAndDate(venueId, date);

    return NextResponse.json(
      {
        success: true,
        message: "Venue blockings retrieved successfully",
        data: blockings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching venue blockings:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch venue blockings",
      },
      { status: 500 }
    );
  }
}

