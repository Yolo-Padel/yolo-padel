import { NextRequest, NextResponse } from "next/server";
import { courtService } from "@/lib/services/court.service";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const venueId = url.searchParams.get("venueId");

    if (!venueId) {
      return NextResponse.json(
        { success: false, message: "venueId query parameter is required" },
        { status: 400 }
      );
    }

    const result = await courtService.getPublicByVenue(venueId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error("GET /api/public/court error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

