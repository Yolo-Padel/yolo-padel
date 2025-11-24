import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { UserType, BookingStatus } from "@/types/prisma";
import { getBookingsForAdmin } from "@/lib/services/booking.service";

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
  const statusParam = searchParams.get("status") || undefined;
  const startDateParam = searchParams.get("startDate") || undefined;
  const endDateParam = searchParams.get("endDate") || undefined;
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  // Debug logging
  console.log("[API] Raw query parameters:", {
    search,
    venue,
    statusParam,
    startDateParam,
    endDateParam,
    pageParam,
    limitParam,
  });

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

  // Validate booking status (must be valid enum value)
  let status: BookingStatus | undefined = undefined;
  if (statusParam) {
    const validStatuses: BookingStatus[] = [
      BookingStatus.PENDING,
      BookingStatus.UPCOMING,
      BookingStatus.COMPLETED,
      BookingStatus.CANCELLED,
      BookingStatus.NO_SHOW,
    ];
    if (validStatuses.includes(statusParam as BookingStatus)) {
      status = statusParam as BookingStatus;
    }
  }

  // Sanitize search input (trim whitespace)
  const sanitizedSearch = search?.trim() || undefined;

  // Validate venue ID (supports both UUID and CUID formats)
  let venueId: string | undefined = undefined;
  if (venue) {
    // UUID format: 8-4-4-4-12 hex characters (e.g., 550e8400-e29b-41d4-a716-446655440000)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // CUID format: starts with 'c', followed by alphanumeric (e.g., cmicsqnyf001alg22hr3g2zih)
    const cuidRegex = /^c[a-z0-9]{24}$/i;

    if (uuidRegex.test(venue) || cuidRegex.test(venue)) {
      venueId = venue;
      console.log("[API] Venue ID validated:", venueId);
    } else {
      console.warn("[API] Invalid venue ID format:", venue);
    }
  }

  // Parse and validate dates (ISO format)
  let startDate: Date | undefined = undefined;
  if (startDateParam) {
    try {
      const parsed = new Date(startDateParam);
      // Check if date is valid
      if (!isNaN(parsed.getTime())) {
        startDate = parsed;
      }
    } catch (error) {
      // Invalid date format, ignore
      console.warn("Invalid startDate format:", startDateParam);
    }
  }

  let endDate: Date | undefined = undefined;
  if (endDateParam) {
    try {
      const parsed = new Date(endDateParam);
      // Check if date is valid
      if (!isNaN(parsed.getTime())) {
        endDate = parsed;
      }
    } catch (error) {
      // Invalid date format, ignore
      console.warn("Invalid endDate format:", endDateParam);
    }
  }

  return {
    search: sanitizedSearch,
    venueId,
    status,
    startDate,
    endDate,
    page,
    limit,
  };
}

/**
 * GET /api/admin/bookings
 *
 * Fetch bookings for admin dashboard with server-side filtering and pagination
 *
 * Query Parameters:
 * - search: string (optional) - Search across booking code, customer name, email, court name, venue name
 * - venue: string (UUID, optional) - Filter by venue ID
 * - status: BookingStatus (optional) - Filter by booking status
 * - startDate: string (ISO date, optional) - Filter bookings on or after this date
 * - endDate: string (ISO date, optional) - Filter bookings on or before this date
 * - page: number (default: 1) - Page number for pagination
 * - limit: number (default: 10, max: 100) - Items per page
 *
 * Authorization:
 * - ADMIN: Can view all bookings from all venues
 * - STAFF: Can only view bookings from assigned venues
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: Booking[],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     totalPages: number
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication - Verify JWT token
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

    // 2. Authorization - Check if user has admin access (ADMIN or STAFF)
    if (!ALLOWED_ADMIN_ROLES.includes(user.userType)) {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // 3. Parse and validate query parameters
    const { search, venueId, status, startDate, endDate, page, limit } =
      parseQueryParameters(request);

    // Debug logging
    console.log("[API] Parsed query parameters:", {
      search,
      venueId,
      status,
      startDate,
      endDate,
      page,
      limit,
    });

    // 4. Call service layer with validated parameters
    // Service layer handles authorization logic (ADMIN vs STAFF venue restrictions)
    const result = await getBookingsForAdmin({
      userType: user.userType,
      assignedVenueIds: user.assignedVenueIds,
      search,
      venueId,
      status,
      startDate,
      endDate,
      page,
      limit,
    });

    // 5. Format and return response with pagination metadata
    return NextResponse.json({
      success: true,
      message: "Bookings fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    // Handle service layer errors with appropriate status codes
    console.error("[API] Admin get bookings error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch bookings",
      },
      { status: 500 }
    );
  }
}
