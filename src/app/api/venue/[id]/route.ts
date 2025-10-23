import { NextRequest, NextResponse } from "next/server";
import { venueService } from "@/lib/services/venue.service";
import { venueUpdateSchema } from "@/lib/validations/venue.validation";
import { validateRequest } from "@/lib/validate-request";
import { verifyAuth } from "@/lib/auth-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await venueService.getById(params.id);
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.data, message: result.message }, { status: 200 });
  } catch (error) {
    console.error("Get venue by id error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify authentication
  const authResult = await verifyAuth(request);
  if (!authResult.isValid) {
    return NextResponse.json({
      success: false,
      message: authResult.error || "Authentication required",
    }, { status: 401 });
  }

  // Merge path param id into body for validation
  const body = await request.json();
  const validation = venueUpdateSchema.safeParse({ ...body, venueId: params.id });
  if (!validation.success) {
    return NextResponse.json({ success: false, message: "Validation failed", errors: validation.error.issues }, { status: 400 });
  }

  try {
    const result = await venueService.update(validation.data);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json({ success: true, data: result.data, message: result.message }, { status: 200 });
  } catch (error) {
    console.error("Update venue error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verify authentication
  const authResult = await verifyAuth(request);
  if (!authResult.isValid) {
    return NextResponse.json({
      success: false,
      message: authResult.error || "Authentication required",
    }, { status: 401 });
  }

  try {
    const result = await venueService.delete({ venueId: params.id });
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json({ success: true, message: result.message }, { status: 200 });
  } catch (error) {
    console.error("Delete venue error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}


