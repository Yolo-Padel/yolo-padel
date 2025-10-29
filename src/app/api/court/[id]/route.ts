// src/app/api/court/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { courtService } from "@/lib/services/court.service";
import { courtCreateSchema } from "@/lib/validations/court.validation";
import { createServiceContext } from "@/types/service-context";
import { verifyAuth } from "@/lib/auth-utils";

// GET /api/court/[id] - Get court by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tokenResult = await verifyAuth(request);

    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }

    const serviceContext = createServiceContext(tokenResult.user?.role!, tokenResult.user?.assignedVenueId);
    const result = await courtService.getById(id, serviceContext);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message
    });
  } catch (error) {
    console.error("GET /api/court/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/court/[id] - Update court
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const tokenResult = await verifyAuth(request);

    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }

    const serviceContext = createServiceContext(tokenResult.user?.role!, tokenResult.user?.assignedVenueId);
    
    // Validate request body
    console.log("Raw body received:", body);
    console.log("Body price:", body.price);
    console.log("Body price type:", typeof body.price);
    
    const validatedData = courtCreateSchema.parse(body);
    console.log("validatedData", validatedData);
    console.log("Validated price:", validatedData.price);
    console.log("Validated price type:", typeof validatedData.price);
    
    const result = await courtService.update(id, validatedData, serviceContext);

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
    });
  } catch (error) {
    console.error("PUT /api/court/[id] error:", error);
    
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

// DELETE /api/court/[id] - Soft delete court
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tokenResult = await verifyAuth(request);

    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }

    const serviceContext = createServiceContext(tokenResult.user?.role!, tokenResult.user?.assignedVenueId);

    const result = await courtService.delete(id, serviceContext);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message
    });
  } catch (error) {
    console.error("DELETE /api/court/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}