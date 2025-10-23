import { venueService } from "@/lib/services/venue.service";
import { venueDeleteSchema } from "@/lib/validations/venue.validation";
import { NextRequest, NextResponse } from "next/server";

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

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = venueDeleteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ success: false, message: "Validation failed" }, { status: 400 });
    }

    const result = await venueService.delete(validationResult.data!);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message: result.message }, { status: 200 });
  } catch (error) {
    console.error("Delete venue error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}