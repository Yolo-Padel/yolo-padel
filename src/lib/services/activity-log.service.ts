import { prisma } from "@/lib/prisma";
import { requirePermission, ServiceContext } from "@/types/service-context";
import { ActionType } from "@/types/action";
import { EntityType } from "@/types/entity";
import { UserType, Prisma } from "@prisma/client";

// ============================================================================
// Types & Interfaces for Admin Activity Log Filtering
// ============================================================================

/**
 * Options for filtering activity logs in admin dashboard
 */
export interface GetActivityLogsForAdminOptions {
  // Filter options
  search?: string;
  entityType?: EntityType;
  actionType?: string; // "CREATE" | "UPDATE" | "DELETE"
  startDate?: Date;
  endDate?: Date;

  // Pagination options
  page?: number;
  limit?: number;
}

/**
 * Pagination metadata for activity log results
 */
export interface ActivityLogPaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Result type for getActivityLogsForAdmin function
 */
export interface GetActivityLogsForAdminResult {
  data: Array<{
    id: string;
    userId: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    changes: Prisma.JsonValue;
    description: string | null;
    createdAt: Date;
    user: {
      id: string;
      email: string;
      userType: UserType;
      profile: {
        fullName: string | null;
      } | null;
    } | null;
  }>;
  pagination: ActivityLogPaginationMetadata;
}

// ============================================================================
// Filter Builder Functions
// ============================================================================

/**
 * Sanitize search input to prevent issues
 * Prisma handles parameterization, but we still trim and validate
 *
 * @param search - Raw search string from user input
 * @returns Sanitized search string or undefined if empty
 */
function sanitizeSearchInput(search?: string): string | undefined {
  if (!search) return undefined;

  // Trim whitespace
  const trimmed = search.trim();

  // Return undefined if empty after trimming
  if (trimmed.length === 0) return undefined;

  return trimmed;
}

/**
 * Build search filter for description, user name, and email
 * Searches across multiple fields using OR logic (case-insensitive)
 *
 * @param search - Search query string
 * @returns Prisma OR clause for searching multiple fields
 */
export function buildSearchFilter(
  search?: string
): Prisma.ActivityLogWhereInput["OR"] {
  const sanitizedSearch = sanitizeSearchInput(search);

  if (!sanitizedSearch) {
    return undefined;
  }

  // Build OR clause to search across multiple fields (case-insensitive)
  return [
    {
      description: {
        contains: sanitizedSearch,
        mode: "insensitive",
      },
    },
    {
      user: {
        profile: {
          fullName: {
            contains: sanitizedSearch,
            mode: "insensitive",
          },
        },
      },
    },
    {
      user: {
        email: {
          contains: sanitizedSearch,
          mode: "insensitive",
        },
      },
    },
  ];
}

/**
 * Build entity type filter for exact matching
 *
 * @param entityType - Entity type to filter by (Venue, Court, Booking, etc.)
 * @returns Prisma where clause for entity type filtering
 */
export function buildEntityTypeFilter(
  entityType?: EntityType
): Prisma.ActivityLogWhereInput["entityType"] {
  // If no entity type specified, return undefined (no filter)
  if (!entityType) {
    return undefined;
  }

  // Return exact match filter
  return entityType;
}

/**
 * Build action type filter for category matching (CREATE, UPDATE, DELETE)
 * Matches actions that start with the specified category
 *
 * @param actionType - Action category to filter by (CREATE, UPDATE, DELETE)
 * @returns Prisma where clause for action type filtering
 */
export function buildActionTypeFilter(
  actionType?: string
): Prisma.ActivityLogWhereInput["action"] {
  // If no action type specified, return undefined (no filter)
  if (!actionType) {
    return undefined;
  }

  // Validate action type is one of the allowed categories
  const validActionTypes = ["CREATE", "UPDATE", "DELETE", "INVITE"];
  if (!validActionTypes.includes(actionType.toUpperCase())) {
    return undefined;
  }

  // Return startsWith filter to match action categories
  // e.g., "CREATE" matches "CREATE_USER", "CREATE_VENUE", etc.
  return {
    startsWith: actionType.toUpperCase(),
  };
}

/**
 * Build date range filter for createdAt field
 * Supports start date only, end date only, or both (inclusive)
 *
 * @param startDate - Start of date range (inclusive)
 * @param endDate - End of date range (inclusive)
 * @returns Prisma where clause for date range filtering
 */
export function buildDateRangeFilter(
  startDate?: Date,
  endDate?: Date
): Prisma.ActivityLogWhereInput["createdAt"] {
  // If no dates specified, return undefined (no filter)
  if (!startDate && !endDate) {
    return undefined;
  }

  // Build date range filter
  const dateFilter: Prisma.DateTimeFilter = {};

  if (startDate) {
    // Set to start of day for inclusive start
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    dateFilter.gte = startOfDay;
  }

  if (endDate) {
    // Set to end of day for inclusive end
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    dateFilter.lte = endOfDay;
  }

  return dateFilter;
}

/**
 * Build pagination parameters and calculate metadata
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Pagination parameters and metadata builder function
 */
export function buildPaginationParams(
  page?: number,
  limit?: number
): {
  skip: number;
  take: number;
  metadata: (total: number) => ActivityLogPaginationMetadata;
} {
  // Default values with validation
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
 * @param options - Filter options from GetActivityLogsForAdminOptions
 * @returns Complete Prisma where clause
 */
export function buildWhereClause(
  options: GetActivityLogsForAdminOptions
): Prisma.ActivityLogWhereInput {
  const { search, entityType, actionType, startDate, endDate } = options;

  // Build individual filter components
  const searchFilter = buildSearchFilter(search);
  const entityTypeFilter = buildEntityTypeFilter(entityType);
  const actionTypeFilter = buildActionTypeFilter(actionType);
  const dateRangeFilter = buildDateRangeFilter(startDate, endDate);

  // Combine all filters with AND logic
  const where: Prisma.ActivityLogWhereInput = {};

  // Search filter (OR clause for multiple fields)
  if (searchFilter) {
    where.OR = searchFilter;
  }

  // Entity type filter (exact match)
  if (entityTypeFilter) {
    where.entityType = entityTypeFilter;
  }

  // Action type filter (startsWith for category matching)
  if (actionTypeFilter) {
    where.action = actionTypeFilter;
  }

  // Date range filter
  if (dateRangeFilter) {
    where.createdAt = dateRangeFilter;
  }

  return where;
}

// ============================================================================
// Main Query Function
// ============================================================================

/**
 * Get activity logs for admin dashboard with server-side filtering and pagination
 *
 * This function implements comprehensive filtering based on:
 * - Search query (description, user name, email)
 * - Entity type (Venue, Court, Booking, Order, User, Invoice)
 * - Action type category (CREATE, UPDATE, DELETE)
 * - Date range (start date, end date)
 * - Pagination
 *
 * All filters are applied at the database level for optimal performance.
 *
 * @param options - Filter and pagination options
 * @returns Filtered activity logs with pagination metadata
 *
 * @example
 * // Search for activity logs
 * const result = await getActivityLogsForAdmin({
 *   search: "venue",
 *   page: 1,
 *   limit: 10
 * });
 *
 * @example
 * // Filter by entity type and date range
 * const result = await getActivityLogsForAdmin({
 *   entityType: "Venue",
 *   startDate: new Date("2024-01-01"),
 *   endDate: new Date("2024-12-31"),
 *   page: 1,
 *   limit: 10
 * });
 */
export async function getActivityLogsForAdmin(
  options: GetActivityLogsForAdminOptions
): Promise<GetActivityLogsForAdminResult> {
  // Build where clause combining all filters
  const where = buildWhereClause(options);

  // Build pagination parameters
  const { skip, take, metadata } = buildPaginationParams(
    options.page,
    options.limit
  );

  // Execute query with filters and pagination
  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userType: true,
            profile: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    }),
    prisma.activityLog.count({ where }),
  ]);

  // Return data with pagination metadata
  return {
    data: logs,
    pagination: metadata(total),
  };
}

type RecordActivityParams = {
  context: ServiceContext;
  action: ActionType;
  entityType: EntityType;
  entityId?: string | null;
  changes?: Record<string, unknown> | null;
  description?: string | null;
};

export type ChangesDiff = {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
};

export function buildChangesDiff<T extends Record<string, unknown>>(
  oldData: Partial<T>,
  newData: Partial<T>,
  keys?: Array<keyof T>
): ChangesDiff | null {
  const before: Record<string, unknown> = {};
  const after: Record<string, unknown> = {};

  const candidates = keys
    ? (keys as string[])
    : Array.from(
        new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})])
      );

  let changed = false;
  for (const key of candidates) {
    const prevVal = (oldData as any)?.[key];
    const nextVal = (newData as any)?.[key];

    const prevDefined = typeof prevVal !== "undefined";
    const nextDefined = typeof nextVal !== "undefined";

    // Consider value changed if either side defined and values differ (shallow compare)
    const isDifferent = JSON.stringify(prevVal) !== JSON.stringify(nextVal);

    if ((prevDefined || nextDefined) && isDifferent) {
      before[key] = prevDefined ? prevVal : null;
      after[key] = nextDefined ? nextVal : null;
      changed = true;
    }
  }

  if (!changed) return null;
  return { before, after };
}

/**
 * Generate human-readable description from changes diff
 */
export function generateDescriptionFromChanges(
  action: ActionType,
  entityType: EntityType,
  changes?: Record<string, unknown> | null
): string | null {
  if (!changes) return null;

  // Check if changes follows { before, after } structure
  const isDiffFormat =
    changes.before !== undefined && changes.after !== undefined;

  if (!isDiffFormat) {
    return null;
  }

  const before = changes.before as Record<string, unknown>;
  const after = changes.after as Record<string, unknown>;

  const beforeKeys = Object.keys(before || {});
  const afterKeys = Object.keys(after || {});
  const allKeys = Array.from(new Set([...beforeKeys, ...afterKeys]));

  // Handle CREATE action (before is empty)
  if (action.includes("CREATE") || action.includes("INVITE")) {
    if (beforeKeys.length === 0 && afterKeys.length > 0) {
      const fieldList = allKeys
        .map((key) => {
          const value = after[key];
          return `${key}: ${formatValue(value)}`;
        })
        .join(", ");
      return `Created ${entityType.toLowerCase()} with ${fieldList}`;
    }
  }

  // Handle DELETE action
  if (action.includes("DELETE")) {
    if (
      after.isArchived === true ||
      (beforeKeys.length > 0 && afterKeys.length === 0)
    ) {
      return `Deleted ${entityType.toLowerCase()}`;
    }
  }

  // Handle UPDATE action
  if (action.includes("UPDATE")) {
    const changeDescriptions: string[] = [];

    for (const key of allKeys) {
      const beforeVal = before[key];
      const afterVal = after[key];

      // Skip if values are the same
      if (JSON.stringify(beforeVal) === JSON.stringify(afterVal)) {
        continue;
      }

      // Handle isArchived change
      if (key === "isArchived") {
        if (afterVal === true) {
          changeDescriptions.push(`${entityType.toLowerCase()} archived`);
        } else if (afterVal === false) {
          changeDescriptions.push(`${entityType.toLowerCase()} restored`);
        }
        continue;
      }

      // Handle isActive change
      if (key === "isActive") {
        if (afterVal === true) {
          changeDescriptions.push(`${entityType.toLowerCase()} activated`);
        } else if (afterVal === false) {
          changeDescriptions.push(`${entityType.toLowerCase()} deactivated`);
        }
        continue;
      }

      // Generic field change
      const beforeFormatted = formatValue(beforeVal);
      const afterFormatted = formatValue(afterVal);

      if (beforeVal === null || beforeVal === undefined) {
        changeDescriptions.push(`added ${key}: ${afterFormatted}`);
      } else if (afterVal === null || afterVal === undefined) {
        changeDescriptions.push(`removed ${key}: ${beforeFormatted}`);
      } else {
        changeDescriptions.push(
          `${key} changed from ${beforeFormatted} to ${afterFormatted}`
        );
      }
    }

    if (changeDescriptions.length > 0) {
      return changeDescriptions.join(", ");
    }
  }

  return null;
}

/**
 * Format value for display in description
 */
function formatValue(value: unknown): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export const activityLogService = {
  record: async ({
    context,
    action,
    entityType,
    entityId,
    changes,
  }: RecordActivityParams) => {
    try {
      // Auto-generate description if not provided
      const finalDescription =
        generateDescriptionFromChanges(action, entityType, changes) || null;

      await prisma.activityLog.create({
        data: {
          userId: context.actorUserId || null,
          action,
          entityType,
          entityId: entityId ?? null,
          // Prisma expects Json type; ensure undefined -> null for consistency
          changes: (changes as any) ?? null,
          description: finalDescription,
        },
      });
    } catch (error) {
      // Logging failure must be non-blocking
      console.error("recordActivity error:", error);
    }
  },
  getActivity: async (context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);

      if (accessError) return accessError;
      // Get all users
      const activityLogs = await prisma.activityLog.findMany({
        include: { user: { include: { profile: true } } },
        orderBy: { createdAt: "desc" },
      });
      return {
        success: true,
        data: activityLogs,
        message: "Activity logs retrieved successfully",
      };
    } catch (error) {
      console.error("getActivity error:", error);
      return {
        success: false,
        message: "Internal server error",
      };
    }
  },
};
