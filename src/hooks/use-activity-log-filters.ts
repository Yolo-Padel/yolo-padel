"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * Activity Log Filters interface
 * Defines the shape of filter state for activity log filtering
 */
export interface ActivityLogFilters {
  search: string;
  entityType: string;
  actionType: string;
  startDate: string;
  endDate: string;
  page: number;
}

interface UseActivityLogFiltersReturn {
  filters: ActivityLogFilters;
  setSearch: (value: string) => void;
  setEntityType: (value: string) => void;
  setActionType: (value: string) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const DEFAULT_FILTERS: ActivityLogFilters = {
  search: "",
  entityType: "",
  actionType: "",
  startDate: "",
  endDate: "",
  page: 1,
};

export function useActivityLogFilters(): UseActivityLogFiltersReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize state from URL search params on mount
  const [filters, setFilters] = useState<ActivityLogFilters>(() => ({
    search: searchParams.get("search") || DEFAULT_FILTERS.search,
    entityType: searchParams.get("entityType") || DEFAULT_FILTERS.entityType,
    actionType: searchParams.get("actionType") || DEFAULT_FILTERS.actionType,
    startDate: searchParams.get("startDate") || DEFAULT_FILTERS.startDate,
    endDate: searchParams.get("endDate") || DEFAULT_FILTERS.endDate,
    page: parseInt(searchParams.get("page") || "1", 10) || DEFAULT_FILTERS.page,
  }));

  // Computed value: hasActiveFilters
  // Returns true if any filter is different from its default value
  const hasActiveFilters =
    filters.search !== DEFAULT_FILTERS.search ||
    filters.entityType !== DEFAULT_FILTERS.entityType ||
    filters.actionType !== DEFAULT_FILTERS.actionType ||
    filters.startDate !== DEFAULT_FILTERS.startDate ||
    filters.endDate !== DEFAULT_FILTERS.endDate;

  // URL synchronization - update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-empty parameters to URL
    if (filters.search) params.set("search", filters.search);
    if (filters.entityType) params.set("entityType", filters.entityType);
    if (filters.actionType) params.set("actionType", filters.actionType);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);
    if (filters.page > 1) params.set("page", filters.page.toString());

    // Update URL without page reload
    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Individual setter functions with auto-reset pagination

  /**
   * Set search filter value
   * Auto-resets page to 1 when search changes (Requirement 1.2)
   */
  const setSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
      page: 1, // Auto-reset page to 1 when search changes
    }));
  };

  /**
   * Set entity type filter value
   * Auto-resets page to 1 when entity type changes (Requirement 2.3)
   */
  const setEntityType = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      entityType: value === "all" ? "" : value, // Convert "all" to empty string
      page: 1, // Auto-reset page to 1 when entity type changes
    }));
  };

  /**
   * Set action type filter value
   * Auto-resets page to 1 when action type changes (Requirement 3.3)
   */
  const setActionType = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      actionType: value === "all" ? "" : value, // Convert "all" to empty string
      page: 1, // Auto-reset page to 1 when action type changes
    }));
  };

  /**
   * Set start date filter value
   * Auto-resets page to 1 when start date changes
   */
  const setStartDate = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      startDate: value,
      page: 1, // Auto-reset page to 1 when start date changes
    }));
  };

  /**
   * Set end date filter value
   * Auto-resets page to 1 when end date changes
   */
  const setEndDate = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      endDate: value,
      page: 1, // Auto-reset page to 1 when end date changes
    }));
  };

  /**
   * Set page number
   * Does not reset other filters
   */
  const setPage = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  /**
   * Reset all filters to default values
   * Clears all filters and resets page to 1 (Requirement 7.2)
   */
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return {
    filters,
    setSearch,
    setEntityType,
    setActionType,
    setStartDate,
    setEndDate,
    setPage,
    resetFilters,
    hasActiveFilters,
  };
}
