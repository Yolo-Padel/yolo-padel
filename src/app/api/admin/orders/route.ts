import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { UserType, PaymentStatus } from "@/types/prisma";
import { getOrdersForAdmin } from "@/lib/services/order.service";

const ALLOWED_ADMIN_ROLES: UserType[] = [UserType.ADMIN, UserType.STAFF];

/**
 * Parse and validate query parameters from request URL
 *
 * @param request - NextRequest object
 * @returns Parsed and validated query parameters
 */
function parseQueryParameters(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Extract query parameters
  const search = searchParams.get("search") || undefined;
  const venue = searchParams.get("venue") || undefined;
  const paymentStatusParam = searchParams.get("paymentStatus") || undefined;
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  // Validate and parse page (default: 1)
  let page = 1;
  if (pageParam) {
    const parsedPage = parseInt(pageParam, 10);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    }
  }

  // Validate and parse limit (default: 10, max: 100)
  let limit = 10;
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100) {
      limit = parsedLimit;
    }
  }

  // Validate payment status (must be valid enum value)
  let paymentStatus: PaymentStatus | undefined = undefined;
  if (paymentStatusParam) {
    const validStatuses: PaymentStatus[] = [
      PaymentStatus.UNPAID,
      PaymentStatus.PAID,
      PaymentStatus.FAILED,
      PaymentStatus.EXPIRED,
    ];
    if (validStatuses.includes(paymentStatusParam as PaymentStatus)) {
      paymentStatus = paymentStatusParam as PaymentStatus;
    }
  }

  // Sanitize search input (trim whitespace)
  const sanitizedSearch = search?.trim() || undefined;

  // Validate venue ID (basic UUID format check)
  let venueId: string | undefined = undefined;
  if (venue) {
    // Basic UUID format validation (8-4-4-4-12 hex characters)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(venue)) {
      venueId = venue;
    }
  }

  return {
    search: sanitizedSearch,
    venueId,
    paymentStatus,
    page,
    limit,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Subtask 3.2: Update authentication and authorization
    // Verify authentication using existing verifyAuth utility
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }

    // Extract user context from auth token
    const { user } = tokenResult;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Invalid user context" },
        { status: 401 }
      );
    }

    // Check if user has admin access (ADMIN or STAFF)
    if (!ALLOWED_ADMIN_ROLES.includes(user.userType)) {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Subtask 3.1: Add query parameter parsing
    // Extract and validate query parameters
    const { search, venueId, paymentStatus, page, limit } =
      parseQueryParameters(request);

    // Subtask 3.4: Call service layer with filter options
    // Build GetOrdersForAdminOptions object from query params and user context
    const result = await getOrdersForAdmin({
      userType: user.userType,
      assignedVenueIds: user.assignedVenueIds,
      search,
      venueId,
      paymentStatus,
      page,
      limit,
    });

    // Subtask 3.5: Return standardized response
    // Format response with success, message, data, and pagination
    return NextResponse.json({
      success: true,
      message: "Orders fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    // Handle service layer errors with appropriate status codes
    console.error("[API] Admin get orders error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
