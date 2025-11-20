import { NextRequest, NextResponse } from "next/server";
import { getActiveBlockings } from "@/lib/services/blocking.service";

/**
 * GET /api/blocking
 * Get active blockings for a specific court and date
 * Query params:
 * - courtId: string (required)
 * - date: string (ISO date, required)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId");
    const dateStr = searchParams.get("date");

    // Validation
    if (!courtId) {
      return NextResponse.json(
        {
          success: false,
          message: "Court ID is required",
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

    // Get active blockings
    const blockings = await getActiveBlockings(courtId, date);

    return NextResponse.json(
      {
        success: true,
        message: "Blockings retrieved successfully",
        data: blockings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching blockings:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch blockings",
      },
      { status: 500 }
    );
  }
}
