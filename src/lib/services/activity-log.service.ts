import { prisma } from "@/lib/prisma";
import { requirePermission, ServiceContext } from "@/types/service-context";
import { ActionType } from "@/types/action";
import { EntityType } from "@/types/entity";
import { UserType, Prisma } from "@prisma/client";

// ============================================================================
// Entity Reference Helper Functions
// ============================================================================

/**
 * Format a date range for display (e.g., "Jan 1, 2024 - Jan 31, 2024")
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const startFormatted = startDate.toLocaleDateString("en-US", options);
  const endFormatted = endDate.toLocaleDateString("en-US", options);

  // If same date, return single date
  if (startFormatted === endFormatted) {
    return startFormatted;
  }

  return `${startFormatted} - ${endFormatted}`;
}

/**
 * Entity reference resolver type definitions
 */
type VenueData = { name: string };
type CourtData = { name: string };
type UserData = {
  email: string;
  profile?: { fullName?: string | null } | null;
};
type BookingData = { code: string };
type OrderData = { orderCode: string };
type RoleData = { name: string };
type DynamicPriceData = {
  courtName: string;
  startDate: Date;
  endDate: Date;
};

/**
 * Entity reference helper functions for resolving human-readable references
 * for each entity type. These helpers are used by services when recording
 * activity logs to provide meaningful context instead of technical IDs.
 */
export const entityReferenceHelpers = {
  /**
   * Get entity reference for a Venue
   * @param venue - Venue data with name
   * @returns Venue name as the reference
   */
  venue: (venue: VenueData): string => venue.name,

  /**
   * Get entity reference for a Court
   * @param court - Court data with name
   * @returns Court name as the reference
   */
  court: (court: CourtData): string => court.name,

  /**
   * Get entity reference for a User
   * @param user - User data with email and optional profile
   * @returns User's full name if available, otherwise email
   */
  user: (user: UserData): string => user.profile?.fullName || user.email,

  /**
   * Get entity reference for a Booking
   * @param booking - Booking data with code
   * @returns Booking code as the reference
   */
  booking: (booking: BookingData): string => booking.code,

  /**
   * Get entity reference for an Order
   * @param order - Order data with orderCode
   * @returns Order code as the reference
   */
  order: (order: OrderData): string => order.orderCode,

  /**
   * Get entity reference for a Role
   * @param role - Role data with name
   * @returns Role name as the reference
   */
  role: (role: RoleData): string => role.name,

  /**
   * Get entity reference for a Dynamic Price
   * @param data - Dynamic price data with court name and date range
   * @returns Court name with date range (e.g., "Main Court (Jan 1, 2024 - Jan 31, 2024)")
   */
  dynamicPrice: (data: DynamicPriceData): string =>
    `${data.courtName} (${formatDateRange(data.startDate, data.endDate)})`,
};

// ============================================================================
// Permission Change Description Generator
// ============================================================================

/**
 * Input type for a single permission change
 */
export interface PermissionChangeInput {
  moduleId: string;
  permissionId: string;
  previousAllowed: boolean;
  newAllowed: boolean;
}

/**
 * Module information for lookup
 */
export interface ModuleInfo {
  id: string;
  label: string;
}

/**
 * Permission information for lookup
 */
export interface PermissionInfo {
  id: string;
  action: string; // "create", "read", "update", "delete"
}

/**
 * Map permission action to human-readable name
 */
function formatPermissionName(action: string): string {
  const actionMap: Record<string, string> = {
    create: "Create",
    read: "Read",
    update: "Update",
    delete: "Delete",
  };
  return actionMap[action.toLowerCase()] || action;
}

/**
 * Generate a human-readable description for permission changes
 * Groups changes by module and lists enabled/disabled permissions
 *
 * @param changes - Array of permission changes
 * @param modules - Array of module information for ID to label lookup
 * @param permissions - Array of permission information for ID to action lookup
 * @returns Human-readable description of permission changes
 *
 * @example
 * // Returns: "Venue Management: enabled Create, disabled Delete; User Management: enabled Read"
 * generatePermissionChangeDescription(
 *   [
 *     { moduleId: "mod1", permissionId: "perm1", previousAllowed: false, newAllowed: true },
 *     { moduleId: "mod1", permissionId: "perm2", previousAllowed: true, newAllowed: false },
 *     { moduleId: "mod2", permissionId: "perm3", previousAllowed: false, newAllowed: true },
 *   ],
 *   [{ id: "mod1", label: "Venue Management" }, { id: "mod2", label: "User Management" }],
 *   [{ id: "perm1", action: "create" }, { id: "perm2", action: "delete" }, { id: "perm3", action: "read" }]
 * );
 */
export function generatePermissionChangeDescription(
  changes: PermissionChangeInput[],
  modules: ModuleInfo[],
  permissions: PermissionInfo[]
): string {
  if (!changes || changes.length === 0) {
    return "";
  }

  // Create lookup maps for modules and permissions
  const moduleMap = new Map(modules.map((m) => [m.id, m.label]));
  const permissionMap = new Map(permissions.map((p) => [p.id, p.action]));

  // Group changes by module
  const changesByModule = new Map<
    string,
    { enabled: string[]; disabled: string[] }
  >();

  for (const change of changes) {
    // Skip if no actual change
    if (change.previousAllowed === change.newAllowed) {
      continue;
    }

    const moduleLabel = moduleMap.get(change.moduleId) || change.moduleId;
    const permissionAction = permissionMap.get(change.permissionId) || change.permissionId;
    const permissionName = formatPermissionName(permissionAction);

    if (!changesByModule.has(moduleLabel)) {
      changesByModule.set(moduleLabel, { enabled: [], disabled: [] });
    }

    const moduleChanges = changesByModule.get(moduleLabel)!;

    if (change.newAllowed) {
      moduleChanges.enabled.push(permissionName);
    } else {
      moduleChanges.disabled.push(permissionName);
    }
  }

  // Build description string
  const descriptions: string[] = [];

  for (const [moduleLabel, moduleChanges] of changesByModule) {
    const parts: string[] = [];

    if (moduleChanges.enabled.length > 0) {
      parts.push(`enabled ${moduleChanges.enabled.join(", ")}`);
    }

    if (moduleChanges.disabled.length > 0) {
      parts.push(`disabled ${moduleChanges.disabled.join(", ")}`);
    }

    if (parts.length > 0) {
      descriptions.push(`${moduleLabel}: ${parts.join(", ")}`);
    }
  }

  return descriptions.join("; ");
}

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
    entityReference: string | null;
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

/**
 * Parameters for recording an activity log entry
 */
type RecordActivityParams = {
  context: ServiceContext;
  action: ActionType;
  entityType: EntityType;
  entityId?: string | null;
  /** Human-readable reference for the entity (e.g., venue name, user email) */
  entityReference?: string | null;
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
 * Format a field name to be more human-readable
 * Converts camelCase to Title Case with spaces
 */
function formatFieldName(fieldName: string): string {
  // Handle common abbreviations
  const abbreviations: Record<string, string> = {
    id: "ID",
    url: "URL",
    api: "API",
  };

  // Check if it's a known abbreviation
  if (abbreviations[fieldName.toLowerCase()]) {
    return abbreviations[fieldName.toLowerCase()];
  }

  // Convert camelCase to Title Case with spaces
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Format value for display in description
 * Handles complex objects, arrays, and special values in a human-readable way
 */
export function formatValue(value: unknown): string {
  if (value === null) return "empty";
  if (value === undefined) return "empty";

  // Handle boolean values
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  // Handle string values
  if (typeof value === "string") {
    // Don't wrap short strings in quotes for readability
    if (value.length === 0) return "empty";
    return value;
  }

  // Handle number values
  if (typeof value === "number") {
    return String(value);
  }

  // Handle Date objects
  if (value instanceof Date) {
    return value.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) return "empty list";
    if (value.length <= 3) {
      return value.map((item) => formatValue(item)).join(", ");
    }
    return `${value.length} items`;
  }

  // Handle objects
  if (typeof value === "object") {
    try {
      // Check if it's a date string
      const dateStr = (value as any)?.toString?.();
      if (dateStr && !isNaN(Date.parse(dateStr))) {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }

      // For other objects, show a summary
      const keys = Object.keys(value);
      if (keys.length === 0) return "empty";
      if (keys.length <= 2) {
        return keys
          .map((k) => `${formatFieldName(k)}: ${formatValue((value as any)[k])}`)
          .join(", ");
      }
      return `${keys.length} properties`;
    } catch {
      return String(value);
    }
  }

  return String(value);
}

/**
 * Generate human-readable description from changes diff
 * Enhanced to provide clear, informative descriptions for all action types
 *
 * @param action - The action type (CREATE, UPDATE, DELETE, etc.)
 * @param entityType - The type of entity being modified
 * @param changes - The changes payload with before/after values
 * @param entityReference - Optional human-readable reference for the entity
 * @returns Human-readable description or null if cannot generate
 */
export function generateDescriptionFromChanges(
  action: ActionType,
  entityType: EntityType,
  changes?: Record<string, unknown> | null,
  entityReference?: string | null
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

  const entityName = entityType.toLowerCase();
  const entityRef = entityReference ? ` "${entityReference}"` : "";

  // Handle CREATE action (before is empty)
  if (action.includes("CREATE") || action.includes("INVITE")) {
    if (beforeKeys.length === 0 && afterKeys.length > 0) {
      // For CREATE, show key identifying information
      const keyFields = ["name", "email", "code", "orderCode", "bookingCode"];
      const identifyingField = keyFields.find((f) => after[f] !== undefined);

      if (identifyingField && after[identifyingField]) {
        return `Created ${entityName}${entityRef} with ${formatFieldName(identifyingField)}: ${formatValue(after[identifyingField])}`;
      }

      // Fallback: show first few fields
      const displayFields = allKeys.slice(0, 3);
      const fieldList = displayFields
        .map((key) => `${formatFieldName(key)}: ${formatValue(after[key])}`)
        .join(", ");

      const suffix = allKeys.length > 3 ? ` and ${allKeys.length - 3} more fields` : "";
      return `Created ${entityName}${entityRef} with ${fieldList}${suffix}`;
    }
  }

  // Handle DELETE action
  if (action.includes("DELETE")) {
    if (after.isArchived === true) {
      return `Deleted ${entityName}${entityRef}`;
    }
    if (beforeKeys.length > 0 && afterKeys.length === 0) {
      return `Deleted ${entityName}${entityRef}`;
    }
    // Soft delete case
    return `Deleted ${entityName}${entityRef}`;
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

      const fieldName = formatFieldName(key);

      // Handle status changes with clear "from X to Y" format
      if (key === "status" || key.toLowerCase().includes("status")) {
        const fromStatus = formatValue(beforeVal);
        const toStatus = formatValue(afterVal);
        changeDescriptions.push(`Status changed from ${fromStatus} to ${toStatus}`);
        continue;
      }

      // Handle isArchived change
      if (key === "isArchived") {
        if (afterVal === true) {
          changeDescriptions.push(`${entityName} archived`);
        } else if (afterVal === false) {
          changeDescriptions.push(`${entityName} restored`);
        }
        continue;
      }

      // Handle isActive change
      if (key === "isActive") {
        if (afterVal === true) {
          changeDescriptions.push(`${entityName} activated`);
        } else if (afterVal === false) {
          changeDescriptions.push(`${entityName} deactivated`);
        }
        continue;
      }

      // Generic field change with clear formatting
      const beforeFormatted = formatValue(beforeVal);
      const afterFormatted = formatValue(afterVal);

      if (beforeVal === null || beforeVal === undefined) {
        changeDescriptions.push(`${fieldName} set to ${afterFormatted}`);
      } else if (afterVal === null || afterVal === undefined) {
        changeDescriptions.push(`${fieldName} cleared (was ${beforeFormatted})`);
      } else {
        changeDescriptions.push(
          `${fieldName} changed from ${beforeFormatted} to ${afterFormatted}`
        );
      }
    }

    if (changeDescriptions.length > 0) {
      const prefix = entityRef ? `Updated ${entityName}${entityRef}: ` : "";
      return `${prefix}${changeDescriptions.join(", ")}`;
    }
  }

  return null;
}

export const activityLogService = {
  record: async ({
    context,
    action,
    entityType,
    entityId,
    entityReference,
    changes,
  }: RecordActivityParams) => {
    try {
      // Auto-generate description if not provided
      const finalDescription =
        generateDescriptionFromChanges(action, entityType, changes) || null;

      // Use entityReference if provided, otherwise fall back to entityId
      const finalEntityReference = entityReference ?? entityId ?? null;

      await prisma.activityLog.create({
        data: {
          userId: context.actorUserId || null,
          action,
          entityType,
          entityId: entityId ?? null,
          entityReference: finalEntityReference,
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
