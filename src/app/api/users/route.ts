import { NextRequest, NextResponse } from "next/server";
import { usersService, getUsersForAdmin } from "@/lib/services/users.service";
import {
  userDeleteSchema,
  userUpdateSchema,
} from "@/lib/validations/user.validation";
import { verifyAuth } from "@/lib/auth-utils";
import { createServiceContext } from "@/types/service-context";
import { UserType, UserStatus } from "@/types/prisma";

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
  const userTypeParam = searchParams.get("userType") || undefined;
  const statusParam = searchParams.get("status") || undefined;
  const venue = searchParams.get("venue") || undefined;
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

  // Validate user type (must be valid enum value)
  let userTypeFilter: UserType | undefined = undefined;
  if (userTypeParam) {
    const validUserTypes: UserType[] = [
      UserType.ADMIN,
      UserType.STAFF,
      UserType.USER,
    ];
    if (validUserTypes.includes(userTypeParam as UserType)) {
      userTypeFilter = userTypeParam as UserType;
    }
  }

  // Validate status (must be valid enum value)
  let statusFilter: UserStatus | undefined = undefined;
  if (statusParam) {
    const validStatuses: UserStatus[] = [
      UserStatus.JOINED,
      UserStatus.INVITED,
    ];
    if (validStatuses.includes(statusParam as UserStatus)) {
      statusFilter = statusParam as UserStatus;
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
    userTypeFilter,
    statusFilter,
    venueId,
    page,
    limit,
  };
}

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
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

    // 3. Parse & validate query parameters
    const { search, userTypeFilter, statusFilter, venueId, page, limit } =
      parseQueryParameters(request);

    // 4. Call service layer with filter options
    const result = await getUsersForAdmin({
      userType: user.userType,
      assignedVenueIds: user.assignedVenueIds,
      search,
      userTypeFilter,
      statusFilter,
      venueId,
      page,
      limit,
    });

    // 5. Format response with pagination metadata
    return NextResponse.json({
      success: true,
      message: "Users fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("[API] GET /api/users error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = userDeleteSchema.parse(body);
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
      user.assignedVenueIds
    );
    const result = await usersService.deleteUser(validatedData, serviceContext);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("DELETE /api/users error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = userUpdateSchema.parse(body);
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
      user.assignedVenueIds
    );
    const result = await usersService.updateUser(
      validatedData as any,
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
      data: result.data ?? null,
      message: result.message,
    });
  } catch (error) {
    console.error("PATCH /api/users error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Validation error", errors: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
