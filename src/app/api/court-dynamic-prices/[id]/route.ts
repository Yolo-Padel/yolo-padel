import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { verifyAuth } from "@/lib/auth-utils";
import { createServiceContext } from "@/types/service-context";
import { courtDynamicPriceService } from "@/lib/services/court-dynamic-price.service";
import { courtDynamicPriceUpdateSchema } from "@/lib/validations/court-dynamic-price.validation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 },
      );
    }

    const { user } = tokenResult;
    const serviceContext = createServiceContext(
      user.userType,
      user.userId,
      user.assignedVenueIds,
    );

    const result = await courtDynamicPriceService.getById(id, serviceContext);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/court-dynamic-prices/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();
    const { id } = await params;
    const payload = courtDynamicPriceUpdateSchema.parse(body);

    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 },
      );
    }

    const { user } = tokenResult;

    const serviceContext = createServiceContext(
      user.userType,
      user.userId,
      user.assignedVenueIds,
    );

    const result = await courtDynamicPriceService.update(
      id,
      payload,
      serviceContext,
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/court-dynamic-prices/[id] error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: error.flatten(),
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 },
      );
    }

    const { user } = tokenResult;
    const serviceContext = createServiceContext(
      user.userType,
      user.userId,
      user.assignedVenueIds,
    );

    const result = await courtDynamicPriceService.delete(id, serviceContext);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("DELETE /api/court-dynamic-prices/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
