// src/app/api/court/route.ts
import { NextRequest, NextResponse } from "next/server";
import { courtService } from "@/lib/services/court.service";
import { courtCreateSchema } from "@/lib/validations/court.validation";

// GET /api/court - Get all courts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');

    let result;
    if (venueId) {
      result = await courtService.getByVenue(venueId);
    } else {
      result = await courtService.getAll();
    }

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message
    });
  } catch (error) {
    console.error("GET /api/court error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/court - Create new court
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = courtCreateSchema.parse(body);
    
    const result = await courtService.create(validatedData);

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/court error:", error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { message: "Validation error", errors: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}