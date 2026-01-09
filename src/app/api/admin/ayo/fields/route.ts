import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { UserType } from "@/types/prisma";
import { getAyoFields } from "@/lib/services/ayo.service";

const ALLOWED_ADMIN_ROLES: UserType[] = [UserType.ADMIN, UserType.STAFF];

/**
 * GET /api/admin/ayo/fields
 * Fetches list of AYO fields for reference in Court Modal
 *
 * Authentication: Required (JWT token in cookies)
 * Authorization: ADMIN or STAFF roles only
 *
 * Response:
 * - 200: { success: true, data: AyoField[], message: string }
 * - 401: { success: false, message: string } - Unauthenticated
 * - 403: { success: false, message: string } - Unauthorized
 * - 500: { success: false, message: string } - Server/AYO API error
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication - Verify JWT token
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 },
      );
    }

    // Extract user context from auth token
    const { user } = tokenResult;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Invalid user context" },
        { status: 401 },
      );
    }

    // 2. Authorization - Check if user has admin access (ADMIN or STAFF)
    if (!ALLOWED_ADMIN_ROLES.includes(user.userType)) {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 },
      );
    }

    // 3. Call service layer to fetch AYO fields
    const result = await getAyoFields();

    // 4. Handle AYO API error response
    if (result.error) {
      console.error("[API] AYO list-fields error:", result.message);
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 },
      );
    }

    // 5. Return standardized success response
    return NextResponse.json({
      success: true,
      data: result.data,
      message: "AYO fields fetched successfully",
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("[API] Admin get AYO fields error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch AYO fields",
      },
      { status: 500 },
    );
  }
}
