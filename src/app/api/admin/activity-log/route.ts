import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { UserType } from "@/types/prisma";
import { EntityType, ENTITY_TYPES } from "@/types/entity";
import { getActivityLogsForAdmin } from "@/lib/services/activity-log.service";

const ALLOWED_ADMIN_ROLES: UserType[] = [UserType.ADMIN, UserType.STAFF];

/**
 * Valid action type categories for filtering
 */
const VALID_ACTION_TYPES = ["CREATE", "UPDATE", "DELETE", "INVITE"] as const;

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
  const entityTypeParam = searchParams.get("entityType") || undefined;
  const actionTypeParam = searchParams.get("actionType") || undefined;
  const startDateParam = searchParams.get("startDate") || undefined;
  const endDateParam = searchParams.get("endDate") || undefined;
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

  // Validate entity type (must be valid EntityType value)
  let entityType: EntityType | undefined = undefined;
  if (entityTypeParam) {
    const validEntityTypes = Object.values(ENTITY_TYPES);
    if (validEntityTypes.includes(entityTypeParam as EntityType)) {
      entityType = entityTypeParam as EntityType;
    }
  }

  // Validate action type (must be valid action category)
  let actionType: string | undefined = undefined;
  if (actionTypeParam) {
    const upperActionType = actionTypeParam.toUpperCase();
    if (
      VALID_ACTION_TYPES.includes(
        upperActionType as (typeof VALID_ACTION_TYPES)[number]
      )
    ) {
      actionType = upperActionType;
    }
  }

  // Validate and parse start date (ISO date string)
  let startDate: Date | undefined = undefined;
  if (startDateParam) {
    const parsedDate = new Date(startDateParam);
    if (!isNaN(parsedDate.getTime())) {
      startDate = parsedDate;
    }
  }

  // Validate and parse end date (ISO date string)
  let endDate: Date | undefined = undefined;
  if (endDateParam) {
    const parsedDate = new Date(endDateParam);
    if (!isNaN(parsedDate.getTime())) {
      endDate = parsedDate;
    }
  }

  // Sanitize search input (trim whitespace)
  const sanitizedSearch = search?.trim() || undefined;

  return {
    search: sanitizedSearch,
    entityType,
    actionType,
    startDate,
    endDate,
    page,
    limit,
  };
}

/**
 * GET /api/admin/activity-log
 *
 * Fetch activity logs with server-side filtering and pagination.
 *
 * Query Parameters:
 * - search: string (optional) - Search in description, user name, email
 * - entityType: string (optional) - Filter by entity type (Venue, Court, etc.)
 * - actionType: string (optional) - Filter by action category (CREATE, UPDATE, DELETE)
 * - startDate: string (optional) - ISO date string for start of range
 * - endDate: string (optional) - ISO date string for end of range
 * - page: number (optional, default: 1)
 * - limit: number (optional, default: 10, max: 100)
 *
 * Response:
 * {
 *   success: boolean;
 *   data: ActivityLog[];
 *   pagination: {
 *     page: number;
 *     limit: number;
 *     total: number;
 *     totalPages: number;
 *   };
 *   message: string;
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Verify authentication using existing verifyAuth utility
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

    // Step 2: Check if user has admin access (ADMIN or STAFF)
    if (!ALLOWED_ADMIN_ROLES.includes(user.userType)) {
      return NextResponse.json(
        { success: false, message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Step 3: Parse and validate query parameters
    const { search, entityType, actionType, startDate, endDate, page, limit } =
      parseQueryParameters(request);

    // Step 4: Call service layer with filter options
    const result = await getActivityLogsForAdmin({
      search,
      entityType,
      actionType,
      startDate,
      endDate,
      page,
      limit,
    });

    // Step 5: Return standardized response with data and pagination
    return NextResponse.json({
      success: true,
      message: "Activity logs fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    // Handle service layer errors with appropriate status codes
    console.error("[API] Admin get activity logs error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch activity logs",
      },
      { status: 500 }
    );
  }
}
