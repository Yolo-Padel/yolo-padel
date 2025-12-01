"use client";

import { useState } from "react";
import { useAdminOrders, type Order } from "@/hooks/use-order";
import { useOrderFilters } from "@/hooks/use-order-filters";
import { OrderHeader } from "./_components/order-header";
import { OrderFilters } from "./_components/order-filters";
import { OrderTable } from "./_components/order-table";
import { OrderDetailsModal } from "./_components/order-details-modal";
import { OrderTableSkeleton } from "./_components/order-table-skeleton";
import { OrderEmptyState } from "./_components/order-empty-state";
import { PaymentStatus } from "@/types/prisma";

const PAGE_SIZE = 10;

export default function OrderPage() {
  // Use the new useOrderFilters hook for all filter logic
  const {
    filters,
    setSearch,
    setVenue,
    setPaymentStatus,
    setPage,
    resetFilters,
    hasActiveFilters,
  } = useOrderFilters();

  // Modal state
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  // Build options object from filter state and pass to hook
  const filterOptions = {
    search: filters.search || undefined,
    venueId: filters.venue || undefined,
    paymentStatus: (filters.paymentStatus as PaymentStatus) || undefined,
    page: filters.page,
    limit: PAGE_SIZE,
  };

  // Pass filter options to useAdminOrders hook to trigger API call
  const { data, isLoading, isFetching, error } = useAdminOrders(filterOptions);

  // Use pagination metadata from API response
  const orders = data?.data ?? [];
  const apiPagination = data?.pagination;

  // Transform API pagination to match OrderTable's PaginationInfo interface
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

  const handleViewOrder = (order: Order) => {
    setSelected(order);
    setViewOpen(true);
  };

  const handleModalClose = () => {
    setViewOpen(false);
  };

  const handleVenueChange = (value: string) => {
    setVenue(value === "all" ? "" : value);
  };

  const handlePaymentStatusChange = (value: string) => {
    setPaymentStatus(value === "all" ? "" : value);
  };

  // Display error message on failure
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <OrderHeader orderCount={0} />
        <OrderFilters
          searchValue={filters.search}
          onSearchSubmit={setSearch}
          venueFilter={filters.venue}
          onVenueFilterChange={handleVenueChange}
          paymentStatusFilter={filters.paymentStatus}
          onPaymentStatusFilterChange={handlePaymentStatusChange}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />
        <div className="rounded-2xl border border-[#E9EAEB] p-8 text-center">
          <p className="text-red-600 font-medium mb-2">Failed to load orders</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "An error occurred while fetching orders"}
          </p>
        </div>
      </div>
    );
  }

  // Conditional rendering - Empty state
  if (!isInitialLoad && orders.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <OrderHeader orderCount={apiPagination?.total ?? 0} />
        <OrderFilters
          searchValue={filters.search}
          onSearchSubmit={setSearch}
          venueFilter={filters.venue}
          onVenueFilterChange={handleVenueChange}
          paymentStatusFilter={filters.paymentStatus}
          onPaymentStatusFilterChange={handlePaymentStatusChange}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />
        <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
          <OrderEmptyState isFiltered={hasActiveFilters} />
        </div>
      </div>
    );
  }

  // Main UI rendering (includes initial load state)
  return (
    <div className="flex flex-col gap-4">
      <OrderHeader orderCount={apiPagination?.total ?? 0} />
      <OrderFilters
        searchValue={filters.search}
        onSearchSubmit={setSearch}
        venueFilter={filters.venue}
        onVenueFilterChange={handleVenueChange}
        paymentStatusFilter={filters.paymentStatus}
        onPaymentStatusFilterChange={handlePaymentStatusChange}
        hasActiveFilters={hasActiveFilters}
        onReset={resetFilters}
      />

      {isInitialLoad || isRefetching ? (
        <OrderTableSkeleton />
      ) : (
        <OrderTable
          orders={orders}
          paginationInfo={paginationInfo}
          onPageChange={handlePageChange}
          onViewOrder={handleViewOrder}
        />
      )}

      <OrderDetailsModal
        open={viewOpen}
        onOpenChange={handleModalClose}
        order={selected}
      />
    </div>
  );
}
