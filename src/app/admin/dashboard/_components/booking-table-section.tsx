"use client";

import { BookingTable } from "@/app/admin/dashboard/booking/_components/booking-table";
import {
  useSuperAdminBookingDashboard,
  useAdminBookings,
} from "@/hooks/use-booking";
import type { BookingWithRelations } from "@/app/admin/dashboard/booking/_components/booking-table";
import { useBookingFilters } from "@/hooks/use-booking-filters";
import { AdminDashboardFilters } from "./admin-dashboard-filters";
import { Badge } from "@/components/ui/badge";
import { BookingTableDashboardLoading } from "@/app/admin/dashboard/_components/booking-table-dashboard-loading";

const PAGE_SIZE = 10;

export function BookingTableSection({
  onViewBooking,
}: {
  onViewBooking: (booking: BookingWithRelations) => void;
}) {
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

  // Fetch summary data for the sidebar
  const { data: summaryData } = useSuperAdminBookingDashboard();

  // Fetch bookings data with pagination
  const {
    data: bookingsData,
    isLoading,
    error,
  } = useAdminBookings({
    page: filters.page,
    limit: PAGE_SIZE,
    venueId: filters.venue,
  });

  const summary = summaryData?.data?.bookingSummary;
  const bookings = bookingsData?.data || [];
  const pagination = bookingsData?.pagination;

  const summaryItems = [
    { label: "Total Bookings", value: summary?.total },
    { label: "Completed", value: summary?.completed },
    { label: "Pending", value: summary?.pending },
    { label: "Upcoming", value: summary?.upcoming },
    { label: "Cancelled", value: summary?.cancelled },
    { label: "Expired Payment", value: summary?.expiredPayment },
  ];

  const paginationInfo = {
    pageSafe: pagination?.page || 1,
    totalPages: pagination?.totalPages || 1,
    hasPreviousPage: (pagination?.page || 1) > 1,
    hasNextPage: (pagination?.page || 1) < (pagination?.totalPages || 1),
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {isLoading ? (
        <BookingTableDashboardLoading />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-2 items-center">
              <h3 className="text-2xl font-medium text-foreground">
                Booking List
              </h3>
              <Badge className="text-[#6941C6] bg-[#F9F5FF] border-[#E9D7FE] shadow-none rounded-4xl">
                {pagination?.total}{" "}
                {pagination?.total === 1 ? "booking" : "bookings"}
              </Badge>
            </div>
            <AdminDashboardFilters
              venueFilter={filters.venue}
              onVenueChange={setVenue}
            />
          </div>
          {bookings.length === 0 ? (
            <div className="flex-1 rounded-2xl border border-[#E9EAEB] p-8 text-center">
              <p className="text-muted-foreground">No bookings found</p>
            </div>
          ) : (
            <BookingTable
              bookings={bookings}
              paginationInfo={paginationInfo}
              onPageChange={handlePageChange}
              onViewBooking={onViewBooking}
            />
          )}
        </div>
      )}
    </div>
  );
}
