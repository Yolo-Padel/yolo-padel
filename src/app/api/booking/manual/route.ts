import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { manualBookingSchema } from "@/lib/validations/manual-booking.validation";
import { manualBookingService } from "@/lib/services/manual-booking.service";
import { createRequestContext } from "@/types/request-context";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: tokenResult.error,
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = manualBookingSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.issues[0]?.message || "Validasi input tidak valid";
      return NextResponse.json(
        {
          success: false,
          data: null,
          message,
          errors: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const { user } = tokenResult;

    // Get user dengan roleId untuk dynamic RBAC
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { roleRef: true },
    });

    if (!userWithRole?.roleId) {
      return NextResponse.json(
        { success: false, message: "User role not found" },
        { status: 403 }
      );
    }

    const requestContext = createRequestContext(
      userWithRole.roleId,
      user.userId,
      user.assignedVenueId
    );

    const result = await manualBookingService.create(
      parsed.data,
      requestContext
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          data: result.data,
          message: result.message,
        },
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
    console.error("Manual booking API error:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
