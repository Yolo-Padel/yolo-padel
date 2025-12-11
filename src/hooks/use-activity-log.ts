import { useQuery } from "@tanstack/react-query";
import { ActivityLog, User, Profile } from "@/types/prisma";

// ════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════

/**
 * Activity log with user relation for display
 */
export type ActivityLogWithUser = ActivityLog & {
  user: (User & { profile: Profile | null }) | null;
};

/**
 * Pagination metadata returned from API
 */
export interface ActivityLogPaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Options for fetching admin activity logs with filtering and pagination
 * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 8.3
 */
export interface UseAdminActivityLogsOptions {
  /** Search term for description, user name, or email (Requirement 1.1) */
  search?: string;
  /** Filter by entity type (Requirement 2.1) */
  entityType?: string;
  /** Filter by action category: CREATE, UPDATE, DELETE (Requirement 3.1) */
  actionType?: string;
  /** Start date for date range filter (Requirement 4.1) */
  startDate?: string;
  /** End date for date range filter (Requirement 4.1) */
  endDate?: string;
  /** Page number for pagination (Requirement 5.1) */
  page?: number;
  /** Number of items per page (Requirement 5.1) */
  limit?: number;
}

/**
 * API response structure for admin activity logs
 */
interface AdminActivityLogsResponse {
  success: boolean;
  message: string;
  data: ActivityLogWithUser[];
  pagination: ActivityLogPaginationMetadata;
}

// ════════════════════════════════════════════════════════
// API Functions
// ════════════════════════════════════════════════════════

/**
 * Fetch admin activity logs with filtering and pagination
 *
 * @param options - Filter and pagination options
 * @returns Activity logs with pagination metadata
 */
async function getAdminActivityLogsApi(
  options: UseAdminActivityLogsOptions = {}
): Promise<{
  data: ActivityLogWithUser[];
  pagination: ActivityLogPaginationMetadata;
}> {
  // Build query string from options
  const searchParams = new URLSearchParams();

  // Only add defined, non-empty values to query string
  if (options.search) searchParams.append("search", options.search);
  if (options.entityType) searchParams.append("entityType", options.entityType);
  if (options.actionType) searchParams.append("actionType", options.actionType);
  if (options.startDate) searchParams.append("startDate", options.startDate);
  if (options.endDate) searchParams.append("endDate", options.endDate);
  if (options.page) searchParams.append("page", options.page.toString());
  if (options.limit) searchParams.append("limit", options.limit.toString());

  // Build URL with query string
  const queryString = searchParams.toString();
  const url = queryString
    ? `/api/admin/activity-log?${queryString}`
    : "/api/admin/activity-log";

  const response = await fetch(url, {
    credentials: "include",
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const result: AdminActivityLogsResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch activity logs");
  }

  return {
    data: result.data,
    pagination: result.pagination,
  };
}

// ════════════════════════════════════════════════════════
// Hooks
// ════════════════════════════════════════════════════════

/**
 * Hook to fetch admin activity logs with filtering and pagination support
 *
 * Features:
 * - Server-side filtering by search, entity type, action type, date range
 * - Server-side pagination
 * - React Query caching with filter-aware cache keys
 *
 * Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 8.3
 *
 * @param options - Filter and pagination options
 * @returns React Query result with activity logs and pagination metadata
 */
export function useAdminActivityLogs(options: UseAdminActivityLogsOptions = {}) {
  // Include filter options in query key for proper caching
  // This ensures different filter combinations are cached separately
  return useQuery({
    queryKey: ["admin-activity-logs", options],
    queryFn: () => getAdminActivityLogsApi(options),
    staleTime: 1000 * 60 * 2, // 2 minutes - shorter since filters change frequently
  });
}

/**
 * @deprecated Use useAdminActivityLogs instead. This alias is kept for backward compatibility.
 * Will be removed when log-table.tsx is refactored to be a pure presentation component (Task 7.1).
 */
export const useActivityLogsAdmin = useAdminActivityLogs;
