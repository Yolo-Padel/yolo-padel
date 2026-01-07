"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

/**
 * Filter state for user booking list
 */
export interface UserBookingFilters {
  search: string;
  page: number;
}

/**
 * Return type for useUserBookingFilters hook
 */
export interface UseUserBookingFiltersReturn {
  filters: UserBookingFilters;
  setSearch: (value: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const DEFAULT_FILTERS: UserBookingFilters = {
  search: "",
  page: 1,
};

/**
 * Hook for managing user booking filters with URL synchronization
 *
 * Features:
 * - Filter state management (search, page)
 * - URL synchronization (read & write)
 * - Auto-reset pagination on filter change
 * - Computed hasActiveFilters value
 *
 * @returns Filter state and setter functions
 */
export function useUserBookingFilters(): UseUserBookingFiltersReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize state from URL search params on mount
  const [filters, setFilters] = useState<UserBookingFilters>(() => ({
    search: searchParams.get("search") || DEFAULT_FILTERS.search,
    page: parseInt(searchParams.get("page") || "1", 10) || DEFAULT_FILTERS.page,
  }));

  // Computed value: hasActiveFilters
  const hasActiveFilters = filters.search !== DEFAULT_FILTERS.search;

  // URL synchronization - update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-empty parameters to URL
    if (filters.search) params.set("search", filters.search);
    if (filters.page > 1) params.set("page", filters.page.toString());

    // Update URL without page reload
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(newUrl, { scroll: false });
  }, [filters, router, pathname]);

  // Individual setter functions
  const setSearch = useCallback((value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
      page: 1, // Auto-reset page to 1 when search changes
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  // Reset all filters to default values
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    setSearch,
    setPage,
    resetFilters,
    hasActiveFilters,
  };
}
