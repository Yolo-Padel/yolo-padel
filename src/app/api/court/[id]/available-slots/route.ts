// src/app/api/court/[id]/available-slots/route.ts
import { NextRequest, NextResponse } from "next/server";
import { courtService } from "@/lib/services/court.service";

/**
 * GET /api/court/[id]/available-slots
 * Get available time slots for a court on a specific date
 * Query params:
 * - date: string (ISO date, required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const { id } = await params;
    const courtId = id;

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

    // Get available time slots
    const result = await courtService.getAvailableTimeSlots(courtId, date);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error("Error fetching available time slots:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch available time slots",
      },
      { status: 500 }
    );
  }
}
