import { venueService } from "@/lib/services/venue.service";
import { venueCreateSchema, venueDeleteSchema } from "@/lib/validations/venue.validation";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { createServiceContext } from "@/types/service-context";

export async function GET(request: NextRequest) {
  try {
    const tokenResult = await verifyAuth(request);

    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }
    const { user } = tokenResult;
    const serviceContext = createServiceContext(user.role, user.userId, user.assignedVenueId);
    const result = await venueService.getAll(serviceContext);
    
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
    console.error("Get all venues error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();    
    const validatedData = venueCreateSchema.parse(body);
    const tokenResult = await verifyAuth(request);

    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }
    const { user } = tokenResult;
    const serviceContext = createServiceContext(user.role, user.userId, user.assignedVenueId);
    const result = await venueService.create(validatedData, serviceContext, user.userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/venue error:", error);
    
    if (error instanceof Error && error.name === 'ZodError') {
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

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = venueDeleteSchema.parse(body);
    const tokenResult = await verifyAuth(request);

    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }
    const { user } = tokenResult;
    const serviceContext = createServiceContext(user.role, user.userId, user.assignedVenueId);
    const result = await venueService.delete(validatedData, serviceContext);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("DELETE /api/venue error:", error);
    
    if (error instanceof Error && error.name === 'ZodError') {
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