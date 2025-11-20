"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAdminOrders, type Order } from "@/hooks/use-order";
import { OrderHeader } from "./_components/order-header";
import { OrderFilters } from "./_components/order-filters";
import { OrderTable } from "./_components/order-table";
import { OrderDetailsModal } from "./_components/order-details-modal";
import { OrderTableLoading } from "./_components/order-table-loading";
import { OrderEmptyState } from "./_components/order-empty-state";
import { filterOrders } from "@/lib/order-utils";
import {
  calculatePaginationInfo,
  getPaginatedData,
} from "@/lib/pagination-utils";

const PAGE_SIZE = 10;

export default function OrderPage() {
  // State management
  const [page, setPage] = useState(1);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    search: "",
    paymentStatus: "",
    venue: "",
  });

  // Data fetching
  const { data: orders, isLoading, error } = useAdminOrders();

  // Reset page to 1 when search parameters change
  useEffect(() => {
    setPage(1);
  }, [searchParams]);

  const allOrders = orders ?? [];

  // Derived state - Filter orders based on search query
  const filtered = useMemo(
    () => filterOrders(allOrders, searchParams),
    [allOrders, searchParams]
  );

  // Derived state - Calculate pagination info
  const paginationInfo = useMemo(
    () => calculatePaginationInfo(page, filtered.length, PAGE_SIZE),
    [page, filtered.length]
  );

  // Derived state - Get paginated data
  const paginated = useMemo(
    () => getPaginatedData(filtered, page, PAGE_SIZE),
    [filtered, page]
  );

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

  // Conditional rendering - Loading state
  if (isLoading) {
    return <OrderTableLoading />;
  }

  // Conditional rendering - Error state
  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <OrderHeader orderCount={allOrders.length} />
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
  const isFiltered = Boolean(searchParams.get("search"));
  if (filtered.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <OrderHeader orderCount={allOrders.length} />
        <div className="rounded-2xl border border-[#E9EAEB] overflow-hidden">
          <OrderEmptyState isFiltered={isFiltered} />
        </div>
      </div>
    );
  }

  // Main UI renderings
  return (
    <div className="flex flex-col gap-4">
      <OrderHeader orderCount={filtered.length} />
      {/* <OrderFilters
        searchValue={filters.search}
        onSearchChange={(value: string) =>
          setFilters({ ...filters, search: value })
        }
        venueFilter={filters.venue}
        onVenueFilterChange={(value: string) =>
          setFilters({ ...filters, venue: value === "all" ? "" : value })
        }
        paymentStatusFilter={filters.paymentStatus}
        onPaymentStatusFilterChange={(value: string) =>
          setFilters({
            ...filters,
            paymentStatus: value === "all" ? "" : value,
          })
        }
      /> */}

      <OrderTable
        orders={paginated}
        paginationInfo={paginationInfo}
        onPageChange={handlePageChange}
        onViewOrder={handleViewOrder}
      />
      <OrderDetailsModal
        open={viewOpen}
        onOpenChange={handleModalClose}
        order={selected}
      />
    </div>
  );
}
