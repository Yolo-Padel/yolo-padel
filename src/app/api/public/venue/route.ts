import { NextResponse } from "next/server";
import { venueService } from "@/lib/services/venue.service";

export async function GET() {
  try {
    const result = await venueService.getPublicList();

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
    console.error("GET /api/public/venue error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

