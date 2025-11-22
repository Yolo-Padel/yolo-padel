import { verifyAuth } from "@/lib/auth-utils";
import { membershipService } from "@/lib/services/membership.service";
import { createServiceContext } from "@/types/service-context";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, data: null, message: tokenResult.error },
        { status: 401 }
      );
    }
    const { user } = tokenResult;
    const serviceContext = createServiceContext(user.role, user.userId);
    const response = await membershipService.getMemberships(serviceContext);
    if (!response.success) {
      return NextResponse.json(
        { success: false, data: null, message: response.message },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      data: response.data,
      message: response.message,
    });
  } catch (error) {
    console.error("GET /api/membership error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
