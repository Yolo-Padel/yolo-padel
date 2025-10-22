import { venueService } from "@/lib/services/venue.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await venueService.getAll();
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        data: null,
        message: result.message,
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message,
    }, { status: 200 });
  } catch (error) {
    console.error("Get all venues error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}