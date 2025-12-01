// src/app/api/court/route.ts
import { NextRequest, NextResponse } from "next/server";
import { courtService } from "@/lib/services/court.service";
import { courtCreateSchema } from "@/lib/validations/court.validation";
import { createServiceContext } from "@/types/service-context";
import { verifyAuth } from "@/lib/auth-utils";

// GET /api/court - Get all courts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");
    const tokenResult = await verifyAuth(request);

    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }
    const { user } = tokenResult;
    const serviceContext = createServiceContext(
      user.userType,
      user.userId,
      user.assignedVenueIds
    );

    let result;
    if (venueId) {
      result = await courtService.getByVenue(venueId, serviceContext);
    } else {
      result = await courtService.getAll(serviceContext);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error("GET /api/court error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/court - Create new court
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = courtCreateSchema.parse(body);
    const tokenResult = await verifyAuth(request);

    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }
    const { user } = tokenResult;
    const serviceContext = createServiceContext(
      user.userType,
      user.userId,
      user.assignedVenueIds
    );

    const result = await courtService.create(validatedData, serviceContext);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
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
    console.error("POST /api/court error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
