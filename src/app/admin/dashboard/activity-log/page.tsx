"use client";

import { ActivityLogTable } from "./_components/log-table";
import { ActivityLogHeader } from "./_components/log-header";
import { ActivityLogFilters } from "./_components/log-filters";
import { ActivityLogTableSkeleton } from "./_components/log-table-skeleton";
import { ActivityLogEmptyState } from "./_components/log-empty-state";
import { useActivityLogFilters } from "@/hooks/use-activity-log-filters";
import {
  useAdminActivityLogs,
  type ActivityLogWithUser,
} from "@/hooks/use-activity-log";

const PAGE_SIZE = 10;

/**
 * Activity Log Page - Container Component
 *
 * Orchestrates hooks and components following the clean architecture pattern.
 * This container:
 * - Consumes useActivityLogFilters for filter state management
 * - Consumes useAdminActivityLogs for data fetching
 * - Handles loading states (initial load vs refetch)
 * - Handles error state
 * - Handles empty state
 * - Composes ActivityLogHeader, ActivityLogFilters, ActivityLogTable components
 * - Wires up event handlers between hooks and components
 *
 * Requirements: 9.1, 9.2, 9.3, 8.4
 */
export default function ActivityLogPage() {
  // ════════════════════════════════════════════════════════
  // Hooks
  // ════════════════════════════════════════════════════════

  // Filter state management hook
  const {
    filters,
    setSearch,
    setEntityType,
    setActionType,
    setStartDate,
    setEndDate,
    setPage,
    resetFilters,
    hasActiveFilters,
  } = useActivityLogFilters();

  // Build filter options from filter state
  const filterOptions = {
    search: filters.search || undefined,
    entityType: filters.entityType || undefined,
    actionType: filters.actionType || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    page: filters.page,
    limit: PAGE_SIZE,
  };

  // Data fetching hook with filter options
  const { data, isLoading, isFetching, error } =
    useAdminActivityLogs(filterOptions);

  // ════════════════════════════════════════════════════════
  // Derived State
  // ════════════════════════════════════════════════════════

  // Extract data from API response
  const logs = data?.data ?? [];
  const apiPagination = data?.pagination;

  // Transform API pagination to match ActivityLogTable's PaginationInfo interface
  const paginationInfo = apiPagination
    ? {
        pageSafe: apiPagination.page,
        totalPages: apiPagination.totalPages,
        hasPreviousPage: apiPagination.page > 1,
        hasNextPage: apiPagination.page < apiPagination.totalPages,
      }
    : {
        pageSafe: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };

  // Distinguish between initial load and refetch (Requirement 9.1, 9.2)
  const isInitialLoad = isLoading && !data;
  const isRefetching = isFetching && !isInitialLoad;

  // ════════════════════════════════════════════════════════
  // Event Handlers
  // ════════════════════════════════════════════════════════

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewLog = (_log: ActivityLogWithUser) => {
    // The table component handles the modal internally
    // This callback is provided for potential future use (analytics, etc.)
  };

  // ════════════════════════════════════════════════════════
  // Render: Error State
  // ════════════════════════════════════════════════════════

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <ActivityLogHeader />
        <ActivityLogFilters
          searchValue={filters.search}
          onSearchSubmit={setSearch}
          entityTypeFilter={filters.entityType}
          onEntityTypeChange={setEntityType}
          actionTypeFilter={filters.actionType}
          onActionTypeChange={setActionType}
          startDate={filters.startDate}
          onStartDateChange={setStartDate}
          endDate={filters.endDate}
          onEndDateChange={setEndDate}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />
        <div className="rounded-2xl border border-[#E9EAEB] p-8 text-center">
          <p className="text-red-600 font-medium mb-2">
            Failed to load activity logs
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "An error occurred while fetching activity logs"}
          </p>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // Render: Empty State (Requirement 9.3)
  // ════════════════════════════════════════════════════════

  if (!isInitialLoad && logs.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <ActivityLogHeader />
        <ActivityLogFilters
          searchValue={filters.search}
          onSearchSubmit={setSearch}
          entityTypeFilter={filters.entityType}
          onEntityTypeChange={setEntityType}
          actionTypeFilter={filters.actionType}
          onActionTypeChange={setActionType}
          startDate={filters.startDate}
          onStartDateChange={setStartDate}
          endDate={filters.endDate}
          onEndDateChange={setEndDate}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />
        <ActivityLogEmptyState isFiltered={hasActiveFilters} />
      </div>
    );
  }

  // ════════════════════════════════════════════════════════
  // Render: Main UI (includes loading states)
  // ════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col gap-4">
      <ActivityLogHeader />
      <ActivityLogFilters
        searchValue={filters.search}
        onSearchSubmit={setSearch}
        entityTypeFilter={filters.entityType}
        onEntityTypeChange={setEntityType}
        actionTypeFilter={filters.actionType}
        onActionTypeChange={setActionType}
        startDate={filters.startDate}
        onStartDateChange={setStartDate}
        endDate={filters.endDate}
        onEndDateChange={setEndDate}
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      />

      {/* Loading states: Requirement 9.1 (initial load), 9.2 (refetch) */}
      {isInitialLoad || isRefetching ? (
        <ActivityLogTableSkeleton />
      ) : (
        <ActivityLogTable
          logs={logs}
          paginationInfo={paginationInfo}
          onPageChange={handlePageChange}
          onViewLog={handleViewLog}
        />
      )}
    </div>
  );
}
