"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface BookingFilters {
  search: string;
  venue: string;
  status: string;
  startDate: string;
  endDate: string;
  page: number;
}

interface UseBookingFiltersReturn {
  filters: BookingFilters;
  setSearch: (value: string) => void;
  setVenue: (value: string) => void;
  setStatus: (value: string) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const DEFAULT_FILTERS: BookingFilters = {
  search: "",
  venue: "",
  status: "",
  startDate: "",
  endDate: "",
  page: 1,
};

export function useBookingFilters(): UseBookingFiltersReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize state from URL search params on mount
  const [filters, setFilters] = useState<BookingFilters>(() => ({
    search: searchParams.get("search") || DEFAULT_FILTERS.search,
    venue: searchParams.get("venue") || DEFAULT_FILTERS.venue,
    status: searchParams.get("status") || DEFAULT_FILTERS.status,
    startDate: searchParams.get("startDate") || DEFAULT_FILTERS.startDate,
    endDate: searchParams.get("endDate") || DEFAULT_FILTERS.endDate,
    page: parseInt(searchParams.get("page") || "1", 10) || DEFAULT_FILTERS.page,
  }));

  // Computed value: hasActiveFilters
  const hasActiveFilters =
    filters.search !== DEFAULT_FILTERS.search ||
    filters.venue !== DEFAULT_FILTERS.venue ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.startDate !== DEFAULT_FILTERS.startDate ||
    filters.endDate !== DEFAULT_FILTERS.endDate;

  // URL synchronization - update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-empty parameters to URL
    if (filters.search) params.set("search", filters.search);
    if (filters.venue) params.set("venue", filters.venue);
    if (filters.status) params.set("status", filters.status);
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
      venue: value,
      page: 1, // Auto-reset page to 1 when venue changes
    }));
  };

  const setStatus = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value,
      page: 1, // Auto-reset page to 1 when status changes
    }));
  };

  const setStartDate = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      startDate: value,
      page: 1, // Auto-reset page to 1 when start date changes
    }));
  };

  const setEndDate = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      endDate: value,
      page: 1, // Auto-reset page to 1 when end date changes
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
    setStatus,
    setStartDate,
    setEndDate,
    setPage,
    resetFilters,
    hasActiveFilters,
  };
}
