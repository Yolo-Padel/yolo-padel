"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface OrderFilters {
  search: string;
  venue: string;
  paymentStatus: string;
  page: number;
}

interface UseOrderFiltersReturn {
  filters: OrderFilters;
  setSearch: (value: string) => void;
  setVenue: (value: string) => void;
  setPaymentStatus: (value: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const DEFAULT_FILTERS: OrderFilters = {
  search: "",
  venue: "",
  paymentStatus: "",
  page: 1,
};

export function useOrderFilters(): UseOrderFiltersReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize state from URL search params on mount
  const [filters, setFilters] = useState<OrderFilters>(() => ({
    search: searchParams.get("search") || DEFAULT_FILTERS.search,
    venue: searchParams.get("venue") || DEFAULT_FILTERS.venue,
    paymentStatus:
      searchParams.get("paymentStatus") || DEFAULT_FILTERS.paymentStatus,
    page: parseInt(searchParams.get("page") || "1", 10) || DEFAULT_FILTERS.page,
  }));

  // Computed value: hasActiveFilters
  const hasActiveFilters =
    filters.search !== DEFAULT_FILTERS.search ||
    filters.venue !== DEFAULT_FILTERS.venue ||
    filters.paymentStatus !== DEFAULT_FILTERS.paymentStatus;

  // URL synchronization - update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-empty parameters to URL
    if (filters.search) params.set("search", filters.search);
    if (filters.venue) params.set("venue", filters.venue);
    if (filters.paymentStatus)
      params.set("paymentStatus", filters.paymentStatus);
    if (filters.page > 1) params.set("page", filters.page.toString());

    // Update URL without page reload
    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [filters, router]);

  // Individual setter functions
  const setSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
      page: 1, // Auto-reset page to 1 when search changes
    }));
  };

  const setVenue = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      venue: value === "all" ? "" : value, // Convert "all" to empty string
      page: 1, // Auto-reset page to 1 when venue changes
    }));
  };

  const setPaymentStatus = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      paymentStatus: value === "all" ? "" : value, // Convert "all" to empty string
      page: 1, // Auto-reset page to 1 when payment status changes
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
    setVenue,
    setPaymentStatus,
    setPage,
    resetFilters,
    hasActiveFilters,
  };
}
