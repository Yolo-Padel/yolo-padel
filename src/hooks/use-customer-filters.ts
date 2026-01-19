"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface CustomerFilters {
  search: string;
  status: string;
  page: number;
}

interface UseCustomerFiltersReturn {
  filters: CustomerFilters;
  setSearch: (value: string) => void;
  setStatus: (value: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const DEFAULT_FILTERS: CustomerFilters = {
  search: "",
  status: "",
  page: 1,
};

export function useCustomerFilters(): UseCustomerFiltersReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize state from URL search params on mount
  const [filters, setFilters] = useState<CustomerFilters>(() => ({
    search: searchParams.get("search") || DEFAULT_FILTERS.search,
    status: searchParams.get("status") || DEFAULT_FILTERS.status,
    page: parseInt(searchParams.get("page") || "1", 10) || DEFAULT_FILTERS.page,
  }));

  // Computed value: hasActiveFilters
  const hasActiveFilters =
    filters.search !== DEFAULT_FILTERS.search ||
    filters.status !== DEFAULT_FILTERS.status;

  // URL synchronization - update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-empty parameters to URL
    if (filters.search) params.set("search", filters.search);
    if (filters.status) params.set("status", filters.status);
    if (filters.page > 1) params.set("page", filters.page.toString());

    // Update URL without page reload
    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Individual setter functions with auto-reset pagination
  const setSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
      page: 1, // Auto-reset page to 1 when search changes
    }));
  };

  const setStatus = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value,
      page: 1, // Auto-reset page to 1 when status changes
    }));
  };

  const setPage = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  // Reset all filters to default values
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return {
    filters,
    setSearch,
    setStatus,
    setPage,
    resetFilters,
    hasActiveFilters,
  };
}
