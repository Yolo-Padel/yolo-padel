"use client";

import { useState } from "react";
import { useAdminBookings } from "@/hooks/use-booking";
import { useBookingFilters } from "@/hooks/use-booking-filters";
import { BookingHeader } from "./_components/booking-header";
import { BookingFilters } from "./_components/booking-filters";
import { BookingTable } from "./_components/booking-table";
import type { BookingWithRelations } from "./_components/booking-table";
import { BookingDetailsModal } from "./_components/booking-details-modal";
import { BookingTableSkeleton } from "./_components/booking-table-skeleton";
import { BookingEmptyState } from "./_components/booking-empty-state";
import { BookingStatus } from "@/types/prisma";
import { ManualBookingSheet } from "../_components/booking-sheet";
import { usePermissionGuard } from "@/hooks/use-permission-guard";

const PAGE_SIZE = 10;

export default function BookingPage() {
  // Access Control
  const { canAccess: canCreateBooking, isLoading: isCreateLoading } =
    usePermissionGuard({
      moduleKey: "bookings",
      action: "create",
    });
  // Use the useBookingFilters hook for all filter logic
  const {
    filters,
    setSearch,
    setVenue,
    setStatus,
    setStartDate,
    setEndDate,
    setPage,
    resetFilters,
    hasActiveFilters,
  } = useBookingFilters();

  // Modal state
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<BookingWithRelations | null>(null);

  // Manual Booking Sheet state
  const [manualBookingSheetOpen, setManualBookingSheetOpen] = useState(false);

  // Build options object from filter state and pass to hook
  const filterOptions = {
    search: filters.search || undefined,
    venueId: filters.venue || undefined,
    status: (filters.status as BookingStatus) || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    page: filters.page,
    limit: PAGE_SIZE,
  };

  // Pass filter options to useAdminBookings hook to trigger API call
  const { data, isLoading, isFetching, error } =
    useAdminBookings(filterOptions);

  // Use pagination metadata from API response
  const bookings = data?.data ?? [];
  const apiPagination = data?.pagination;

  // Transform API pagination to match BookingTable's PaginationInfo interface
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

  // Distinguish between initial load and refetch
  const isInitialLoad = isLoading && !data;
  const isRefetching = isFetching && !isInitialLoad;

  // Event handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleViewBooking = (booking: BookingWithRelations) => {
    setSelected(booking);
    setViewOpen(true);
  };

  const handleModalClose = () => {
    setViewOpen(false);
  };

  const handleVenueChange = (value: string) => {
    setVenue(value === "all" ? "" : value);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value === "all" ? "" : value);
  };

  const handleOpenAddBooking = () => {
    setManualBookingSheetOpen(true);
  };

  const handleCloseAddBooking = () => {
    setManualBookingSheetOpen(false);
  };

  // Display error message on failure
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <BookingHeader
          bookingCount={0}
          onAddBooking={handleOpenAddBooking}
          canCreateBooking={canCreateBooking}
          isLoadingPermission={isCreateLoading}
        />
        <BookingFilters
          searchValue={filters.search}
          onSearchSubmit={setSearch}
          venueFilter={filters.venue}
          onVenueChange={handleVenueChange}
          statusFilter={filters.status}
          onStatusChange={handleStatusChange}
          startDateValue={filters.startDate}
          onStartDateChange={setStartDate}
          endDateValue={filters.endDate}
          onEndDateChange={setEndDate}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />
        <div className="rounded-2xl border border-[#E9EAEB] p-8 text-center">
          <p className="text-red-600 font-medium mb-2">
            Failed to load bookings
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "An error occurred while fetching bookings"}
          </p>
        </div>
      </div>
    );
  }

  // Conditional rendering - Empty state
  if (!isInitialLoad && bookings.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <BookingHeader
          bookingCount={apiPagination?.total ?? 0}
          onAddBooking={handleOpenAddBooking}
          canCreateBooking={canCreateBooking}
          isLoadingPermission={isCreateLoading}
        />
        <BookingFilters
          searchValue={filters.search}
          onSearchSubmit={setSearch}
          venueFilter={filters.venue}
          onVenueChange={handleVenueChange}
          statusFilter={filters.status}
          onStatusChange={handleStatusChange}
          startDateValue={filters.startDate}
          onStartDateChange={setStartDate}
          endDateValue={filters.endDate}
          onEndDateChange={setEndDate}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />
        <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
          <BookingEmptyState isFiltered={hasActiveFilters} />
        </div>
      </div>
    );
  }

  // Main UI rendering (includes initial load state)
  return (
    <div className="flex flex-col gap-4">
      <BookingHeader
        bookingCount={apiPagination?.total ?? 0}
        onAddBooking={handleOpenAddBooking}
        canCreateBooking={canCreateBooking}
        isLoadingPermission={isCreateLoading}
      />
      <BookingFilters
        searchValue={filters.search}
        onSearchSubmit={setSearch}
        venueFilter={filters.venue}
        onVenueChange={handleVenueChange}
        statusFilter={filters.status}
        onStatusChange={handleStatusChange}
        startDateValue={filters.startDate}
        onStartDateChange={setStartDate}
        endDateValue={filters.endDate}
        onEndDateChange={setEndDate}
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      />

      {isInitialLoad || isRefetching ? (
        <BookingTableSkeleton />
      ) : (
        <BookingTable
          bookings={bookings}
          paginationInfo={paginationInfo}
          onPageChange={handlePageChange}
          onViewBooking={handleViewBooking}
        />
      )}

      <BookingDetailsModal
        open={viewOpen}
        onOpenChange={handleModalClose}
        booking={selected}
      />

      <ManualBookingSheet
        open={manualBookingSheetOpen}
        onOpenChange={handleCloseAddBooking}
        onSuccess={handleCloseAddBooking}
      />
    </div>
  );
}
