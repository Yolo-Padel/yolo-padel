// src/app/api/court/[id]/toggle/route.ts
import { NextRequest, NextResponse } from "next/server";
import { courtService } from "@/lib/services/court.service";
import { createServiceContext } from "@/types/service-context";
import { verifyAuth } from "@/lib/auth-utils";

// PATCH /api/court/[id]/toggle - Toggle court availability
export async function PATCH(
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

    const { user } = tokenResult;
    const serviceContext = createServiceContext(
      user.userType,
      user.userId,
      user.assignedVenueId
    );

    // Get current court status to toggle it
    const currentCourt = await courtService.getById(id, serviceContext);
    if (!currentCourt.success || !currentCourt.data) {
      return NextResponse.json(
        { success: false, message: "Court not found" },
        { status: 404 }
      );
    }

    // Toggle the isActive status
    const newIsActive = !currentCourt.data.isActive;
    const result = await courtService.toggleAvailability(
      id,
      newIsActive,
      serviceContext
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error("PATCH /api/court/[id]/toggle error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
