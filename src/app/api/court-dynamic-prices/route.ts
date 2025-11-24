import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { createServiceContext } from "@/types/service-context";
import { courtDynamicPriceService } from "@/lib/services/court-dynamic-price.service";
import {
  courtDynamicPriceCreateSchema,
  CourtDynamicPriceCreateData,
} from "@/lib/validations/court-dynamic-price.validation";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId");

    if (!courtId) {
      return NextResponse.json(
        {
          success: false,
          message: "courtId query parameter is required",
        },
        { status: 400 }
      );
    }

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

    const result = await courtDynamicPriceService.listByCourt(
      courtId,
      serviceContext
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 403 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/court-dynamic-prices error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = courtDynamicPriceCreateSchema.parse(
      body
    ) as CourtDynamicPriceCreateData;

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

    const result = await courtDynamicPriceService.create(
      payload,
      serviceContext
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/court-dynamic-prices error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
