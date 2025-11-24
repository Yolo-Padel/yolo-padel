import { prisma } from "@/lib/prisma";
import {
  UserCreateData,
  UserDeleteData,
  UserUpdateData,
} from "../validations/user.validation";
import { Prisma } from "@prisma/client";
import { UserStatus } from "@/types/prisma";
import { ServiceContext, requirePermission } from "@/types/service-context";
import { UserType } from "@/types/prisma";
import { activityLogService } from "@/lib/services/activity-log.service";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";

/**
 * Options for filtering users in admin dashboard
 *
 * Security notes:
 * - search: Sanitized and length-limited (max 100 chars)
 * - userTypeFilter: Validated against UserType enum
 * - statusFilter: Validated against UserStatus enum
 * - venueId: Validated as UUID format
 * - page/limit: Validated as positive integers, limit capped at 100
 */
export interface GetUsersForAdminOptions {
  // User context for authorization
  userType: UserType;
  assignedVenueIds: string[];

  // Filter options (will be validated/sanitized)
  search?: string;
  userTypeFilter?: UserType;
  statusFilter?: UserStatus;
  venueId?: string;

  // Pagination options (will be validated)
  page?: number;
  limit?: number;
}

/**
 * Pagination metadata for user results
 */
export interface UserPaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Result type for getUsersForAdmin function
 */
export interface GetUsersForAdminResult {
  data: Array<
    Omit<
      Prisma.UserGetPayload<{
        include: { profile: true; membership: true };
      }>,
      "password"
    > & {
      invitation?: {
        state: "valid" | "expired" | "used" | "none";
        expiresAt?: string;
      };
    }
  >;
  pagination: UserPaginationMetadata;
}

// ============================================================================
// INPUT SANITIZATION AND SECURITY
// ============================================================================
// This section implements comprehensive input validation and sanitization
// to prevent security vulnerabilities and abuse:
//
// 1. SQL Injection Prevention:
//    - Prisma uses parameterized queries (primary defense)
//    - Additional input sanitization as defense-in-depth
//
// 2. Input Length Limits:
//    - Search queries limited to 100 characters
//    - Pagination limit capped at 100 records per page
//
// 3. Enum Validation:
//    - UserType values validated against allowed enum values
//    - UserStatus values validated against allowed enum values
//
// 4. UUID Format Validation:
//    - Venue IDs validated against UUID format (8-4-4-4-12 pattern)
//
// 5. Input Sanitization:
//    - Whitespace trimming
//    - Empty string handling
//    - Invalid input rejection (returns undefined = no filter)
//
// Requirements: 1.5 (SQL injection prevention), 7.5 (pagination limits)
// ============================================================================

/**
 * Maximum allowed length for search input to prevent abuse
 */
const MAX_SEARCH_LENGTH = 100;

/**
 * Sanitize search input to prevent SQL injection and abuse
 * Prisma handles parameterization, but we still trim, validate length, and sanitize
 *
 * @param search - Raw search string from user input
 * @returns Sanitized search string or undefined if empty/invalid
 */
function sanitizeSearchInput(search?: string): string | undefined {
  if (!search) return undefined;

  // Trim whitespace
  const trimmed = search.trim();

  // Return undefined if empty after trimming
  if (trimmed.length === 0) return undefined;

  // Enforce maximum length to prevent abuse
  if (trimmed.length > MAX_SEARCH_LENGTH) {
    // Truncate to max length
    return trimmed.substring(0, MAX_SEARCH_LENGTH);
  }

  // Prisma handles SQL injection prevention through parameterized queries
  // We just need to ensure the string is valid
  return trimmed;
}

/**
 * Validate that a value is a valid UserType enum value
 *
 * @param value - Value to validate
 * @returns Valid UserType or undefined if invalid
 */
function validateUserType(value?: string): UserType | undefined {
  if (!value) return undefined;

  // Check if value is a valid UserType enum value
  const validUserTypes: UserType[] = [
    UserType.ADMIN,
    UserType.STAFF,
    UserType.USER,
  ];

  if (validUserTypes.includes(value as UserType)) {
    return value as UserType;
  }

  return undefined;
}

/**
 * Validate that a value is a valid UserStatus enum value
 *
 * @param value - Value to validate
 * @returns Valid UserStatus or undefined if invalid
 */
function validateUserStatus(value?: string): UserStatus | undefined {
  if (!value) return undefined;

  // Check if value is a valid UserStatus enum value
  const validStatuses: UserStatus[] = [
    UserStatus.ACTIVE,
    UserStatus.INACTIVE,
    UserStatus.INVITED,
  ];

  if (validStatuses.includes(value as UserStatus)) {
    return value as UserStatus;
  }

  return undefined;
}

/**
 * Validate UUID format for venue IDs
 *
 * @param venueId - Venue ID to validate
 * @returns Valid UUID string or undefined if invalid
 */
function validateVenueId(venueId?: string): string | undefined {
  if (!venueId) return undefined;

  // UUID format: 8-4-4-4-12 hex characters
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(venueId)) {
    return venueId;
  }

  return undefined;
}

/**
 * Build search filter for full name and email
 *
 * @param search - Search query string
 * @returns Prisma OR clause for searching multiple fields
 */
function buildSearchFilter(search?: string): Prisma.UserWhereInput["OR"] {
  const sanitizedSearch = sanitizeSearchInput(search);

  if (!sanitizedSearch) {
    return undefined;
  }

  // Build OR clause to search across multiple fields (case-insensitive)
  return [
    {
      profile: {
        fullName: {
          contains: sanitizedSearch,
          mode: "insensitive",
        },
      },
    },
    {
      email: {
        contains: sanitizedSearch,
        mode: "insensitive",
      },
    },
  ];
}

/**
 * Build user type filter with validation
 *
 * @param userTypeFilter - User type to filter by
 * @returns Prisma where clause for user type filtering
 */
function buildUserTypeFilter(
  userTypeFilter?: UserType
): Prisma.UserWhereInput["userType"] {
  // Validate the user type filter
  const validatedUserType = validateUserType(userTypeFilter);

  // If no valid user type specified, return undefined (no filter)
  if (!validatedUserType) {
    return undefined;
  }

  // Filter by the specified user type
  return validatedUserType;
}

/**
 * Build status filter with validation
 *
 * @param statusFilter - User status to filter by
 * @returns Prisma where clause for status filtering
 */
function buildStatusFilter(
  statusFilter?: UserStatus
): Prisma.UserWhereInput["userStatus"] {
  // Validate the status filter
  const validatedStatus = validateUserStatus(statusFilter);

  // If no valid status specified, return undefined (no filter)
  if (!validatedStatus) {
    return undefined;
  }

  // Filter by the specified status
  return validatedStatus;
}

/**
 * Build venue filter based on user type and assigned venues
 * Regular users (USER type) are not assigned to venues, so they are excluded
 *
 * @param userType - The type of user making the request (ADMIN or STAFF)
 * @param assignedVenueIds - Array of venue IDs assigned to STAFF users
 * @param venueId - Optional specific venue filter
 * @returns Prisma where clause for venue filtering
 */
function buildVenueFilter(
  userType: UserType,
  assignedVenueIds: string[],
  venueId?: string
): Prisma.UserWhereInput {
  // Validate venue ID format if provided
  const validatedVenueId = validateVenueId(venueId);

  // If no valid venue filter is requested, handle authorization only
  if (!validatedVenueId) {
    // ADMIN users have unrestricted access
    if (userType === "ADMIN") {
      return {}; // No additional filtering
    }

    // STAFF users are restricted to their assigned venues
    if (userType === "STAFF") {
      // If STAFF has no assigned venues, return a filter that matches nothing
      if (assignedVenueIds.length === 0) {
        return {
          assignedVenueIds: {
            isEmpty: true, // This will match no users
          },
          id: "impossible-id", // Additional safeguard
        };
      }

      // Filter users who have at least one venue in common with staff's assigned venues
      return {
        assignedVenueIds: {
          hasSome: assignedVenueIds,
        },
      };
    }

    // For other user types, return no results
    return {
      id: "impossible-id",
    };
  }

  // Venue filter is requested (and validated)
  // ADMIN users can filter by any venue
  if (userType === "ADMIN") {
    return {
      assignedVenueIds: {
        has: validatedVenueId,
      },
      // Exclude regular users since they don't have venue assignments
      userType: {
        not: UserType.USER,
      },
    };
  }

  // STAFF users can only filter by their assigned venues
  if (userType === "STAFF") {
    // Check if the requested venue is in the staff's assigned venues
    if (assignedVenueIds.includes(validatedVenueId)) {
      return {
        assignedVenueIds: {
          has: validatedVenueId,
        },
        // Exclude regular users since they don't have venue assignments
        userType: {
          not: UserType.USER,
        },
      };
    } else {
      // Requested venue is not assigned, return no results
      return {
        id: "impossible-id",
      };
    }
  }

  // For other user types, return no results
  return {
    id: "impossible-id",
  };
}

/**
 * Build pagination parameters and calculate metadata
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Pagination parameters and metadata
 */
function buildPaginationParams(
  page?: number,
  limit?: number
): {
  skip: number;
  take: number;
  metadata: (total: number) => UserPaginationMetadata;
} {
  // Default values
  const validPage = Math.max(1, page || 1);
  const validLimit = Math.max(1, Math.min(100, limit || 10)); // Cap at 100

  // Calculate skip for Prisma query
  const skip = (validPage - 1) * validLimit;

  // Return skip, take, and a function to build metadata
  return {
    skip,
    take: validLimit,
    metadata: (total: number) => ({
      page: validPage,
      limit: validLimit,
      total,
      totalPages: Math.ceil(total / validLimit),
    }),
  };
}

/**
 * Build complete Prisma where clause combining all filters
 *
 * @param options - Filter options from GetUsersForAdminOptions
 * @returns Complete Prisma where clause
 */
function buildWhereClause(
  options: GetUsersForAdminOptions
): Prisma.UserWhereInput {
  const {
    userType,
    assignedVenueIds,
    search,
    userTypeFilter,
    statusFilter,
    venueId,
  } = options;

  // Build individual filter components
  const searchFilter = buildSearchFilter(search);
  const userTypeFilterClause = buildUserTypeFilter(userTypeFilter);
  const statusFilterClause = buildStatusFilter(statusFilter);
  const venueFilterClause = buildVenueFilter(
    userType,
    assignedVenueIds,
    venueId
  );

  // Combine all filters with AND logic
  const where: Prisma.UserWhereInput = {
    // Always exclude archived users
    isArchived: false,

    // Search filter (OR clause for multiple fields)
    OR: searchFilter,

    // User type filter
    userType: userTypeFilterClause,

    // Status filter
    userStatus: statusFilterClause,

    // Venue filter (handles both ADMIN and STAFF authorization)
    ...venueFilterClause,
  };

  return where;
}

/**
 * Get users for admin dashboard with server-side filtering and pagination
 *
 * This function implements comprehensive filtering based on:
 * - User authorization (ADMIN vs STAFF with venue restrictions)
 * - Search query (full name, email)
 * - User type (ADMIN, STAFF, USER)
 * - User status (ACTIVE, INACTIVE, INVITED)
 * - Venue assignment
 * - Pagination
 *
 * All filters are applied at the database level for optimal performance.
 *
 * @param options - Filter and pagination options
 * @returns Filtered users with pagination metadata
 *
 * @example
 * // ADMIN user searching for users
 * const result = await getUsersForAdmin({
 *   userType: "ADMIN",
 *   assignedVenueIds: [],
 *   search: "john",
 *   page: 1,
 *   limit: 10
 * });
 *
 * @example
 * // STAFF user viewing users from assigned venues
 * const result = await getUsersForAdmin({
 *   userType: "STAFF",
 *   assignedVenueIds: ["venue-1", "venue-2"],
 *   userTypeFilter: "STAFF",
 *   page: 1,
 *   limit: 10
 * });
 */
export async function getUsersForAdmin(
  options: GetUsersForAdminOptions
): Promise<GetUsersForAdminResult> {
  // Build where clause combining all filters
  const where = buildWhereClause(options);

  // Build pagination parameters
  const { skip, take, metadata } = buildPaginationParams(
    options.page,
    options.limit
  );

  // Execute query with filters and pagination
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        profile: true,
        membership: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);

  // Remove passwords from results
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);

  // Build invitation state for INVITED users (no schema changes)
  const invitedEmails = usersWithoutPasswords
    .filter((u) => u.userStatus === UserStatus.INVITED)
    .map((u) => u.email);

  const emailToLatestLink: Record<
    string,
    { used: boolean; expiresAt: Date } | undefined
  > = {};

  if (invitedEmails.length > 0) {
    const links = await prisma.magicLink.findMany({
      where: { email: { in: invitedEmails } },
      orderBy: [{ email: "asc" }, { createdAt: "desc" }],
    });

    for (const link of links) {
      if (!emailToLatestLink[link.email]) {
        emailToLatestLink[link.email] = {
          used: link.used,
          expiresAt: link.expiresAt,
        };
      }
    }
  }

  const now = new Date();
  const usersWithInvitation = usersWithoutPasswords.map((u) => {
    if (u.userStatus !== UserStatus.INVITED) return u;

    const latest = emailToLatestLink[u.email];
    let state: "valid" | "expired" | "used" | "none" = "none";
    let expiresAt: Date | undefined = undefined;

    if (latest) {
      expiresAt = latest.expiresAt;
      if (latest.used) state = "used";
      else if (latest.expiresAt < now) state = "expired";
      else state = "valid";
    }

    return {
      ...u,
      invitation: {
        state,
        expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
      },
    };
  });

  // Return data with pagination metadata
  return {
    data: usersWithInvitation,
    pagination: metadata(total),
  };
}

export const usersService = {
  getUsers: async (context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);

      if (accessError) return accessError;
      // Get all users
      const users = await prisma.user.findMany({
        where: { isArchived: false },
        include: { profile: true, membership: true },
        orderBy: { createdAt: "desc" },
      });

      const usersWithoutPasswords = users.map(({ password, ...user }) => user);

      // Build invitation state for INVITED users (no schema changes)
      const invitedEmails = usersWithoutPasswords
        .filter((u) => u.userStatus === UserStatus.INVITED)
        .map((u) => u.email);

      const emailToLatestLink: Record<
        string,
        { used: boolean; expiresAt: Date } | undefined
      > = {};
      if (invitedEmails.length > 0) {
        const links = await prisma.magicLink.findMany({
          where: { email: { in: invitedEmails } },
          orderBy: [{ email: "asc" }, { createdAt: "desc" }],
        });
        for (const link of links) {
          if (!emailToLatestLink[link.email]) {
            emailToLatestLink[link.email] = {
              used: link.used,
              expiresAt: link.expiresAt,
            } as any;
          }
        }
      }

      const now = new Date();
      const usersWithInvitation = usersWithoutPasswords.map((u) => {
        if (u.userStatus !== UserStatus.INVITED) return u as any;
        const latest = emailToLatestLink[u.email];
        let state: "valid" | "expired" | "used" | "none" = "none";
        let expiresAt: Date | undefined = undefined;
        if (latest) {
          expiresAt = latest.expiresAt;
          if (latest.used) state = "used";
          else if (latest.expiresAt < now) state = "expired";
          else state = "valid";
        }
        return {
          ...u,
          invitation: {
            state,
            expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
          },
        } as any;
      });

      return {
        success: true,
        data: {
          users: usersWithInvitation,
        },
        message: "Users fetched successfully",
      };
    } catch (error) {
      console.error("Get users error:", error);
      return {
        success: false,
        data: null,
        message: "Failed to fetch users",
      };
    }
  },

  createUser: async (
    data: UserCreateData,
    context: ServiceContext,
    tx?: Prisma.TransactionClient
  ) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      const user = await (tx || prisma).user.create({
        data: {
          email: data.email,
          userType: data.userType,
          userStatus: UserStatus.INVITED,
          assignedVenueIds: data.assignedVenueIds || [],
          membershipId: data.membershipId || null,
          roleId: data.roleId || null,
        },
      });
      // audit log (non-blocking)
      activityLogService.record({
        context,
        action: ACTION_TYPES.CREATE_USER,
        entityType: ENTITY_TYPES.USER,
        entityId: user.id,
        changes: {
          before: {},
          after: {
            email: user.email,
            userType: user.userType,
            assignedVenueIds: user.assignedVenueIds,
            userStatus: user.userStatus,
            membershipId: user.membershipId ?? null,
            roleId: user.roleId ?? null,
          },
        } as any,
      });
      return {
        success: true,
        data: user,
        message: "User created successfully",
      };
    } catch (error) {
      console.error("Create user error:", error);

      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Failed to create user",
      };
    }
  },

  updateUser: async (data: UserUpdateData, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      const existing = await prisma.user.findUnique({
        where: { id: data.userId },
        include: { profile: true },
      });
      if (!existing || existing.isArchived) {
        return { success: false, data: null, message: "User not found" } as any;
      }

      const assignedVenueIds =
        data.userType === UserType.USER ? [] : (data.assignedVenueIds ?? []);
      const roleId =
        data.userType === UserType.USER ? null : data.roleId || null;

      const updated = await prisma.user.update({
        where: { id: data.userId },
        data: {
          email: data.email,
          userType: data.userType,
          assignedVenueIds,
          membershipId: data.membershipId || null,
          roleId,
        },
        include: { profile: true, membership: true },
      });

      // Update or create profile fullName
      if (data.fullName) {
        const hasProfile = !!existing.profile;
        if (hasProfile) {
          await prisma.profile.update({
            where: { userId: data.userId },
            data: { fullName: data.fullName },
          });
        } else {
          await prisma.profile.create({
            data: { userId: data.userId, fullName: data.fullName },
          });
        }
      }

      // audit log (minimal diff)
      activityLogService.record({
        context,
        action: ACTION_TYPES.UPDATE_USER,
        entityType: ENTITY_TYPES.USER,
        entityId: data.userId,
        changes: {
          before: {
            email: existing.email,
            userType: existing.userType,
            assignedVenueIds: existing.assignedVenueIds,
            fullName: existing.profile?.fullName ?? null,
            membershipId: existing.membershipId ?? null,
            roleId: existing.roleId ?? null,
          },
          after: {
            email: data.email,
            userType: data.userType,
            assignedVenueIds,
            fullName: data.fullName,
            membershipId: data.membershipId ?? null,
            roleId: data.roleId ?? null,
          },
        } as any,
      });

      return {
        success: true,
        data: updated,
        message: "User updated successfully",
      } as any;
    } catch (error) {
      console.error("Update user error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Failed to update user",
      } as any;
    }
  },

  deleteUser: async (data: UserDeleteData, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      const updated = await prisma.user.update({
        where: { id: data.userId },
        data: { isArchived: true },
      });
      // audit log
      activityLogService.record({
        context,
        action: ACTION_TYPES.DELETE_USER,
        entityType: ENTITY_TYPES.USER,
        entityId: data.userId,
        changes: {
          before: { isArchived: false },
          after: { isArchived: true },
        } as any,
      });
      return {
        success: true,
        message: "User deleted successfully",
      };
    } catch (error) {
      console.error("Delete user error:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete user",
      };
    }
  },
};
