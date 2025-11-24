"use client";

import { cn } from "@/lib/utils";
import { BookingTable } from "@/app/admin/dashboard/booking/_components/booking-table";
import { BookingTableLoading } from "@/app/admin/dashboard/booking/_components/booking-table-loading";
import {
  useSuperAdminBookingDashboard,
  useAdminBookings,
} from "@/hooks/use-booking";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import type { BookingWithRelations } from "@/app/admin/dashboard/booking/_components/booking-table";

const numberFormatter = new Intl.NumberFormat("id-ID");

function formatCount(value?: number | null) {
  if (value === undefined || value === null) return "-";
  return numberFormatter.format(value);
}

function SummarySkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={`summary-skeleton-${index}`}
          className={cn(
            "flex gap-4 items-start px-4 py-8",
            index !== 3 && "border-b border-border"
          )}
        >
          <div className="flex flex-col w-full gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BookingTableSection() {
  const [page, setPage] = useState(1);

  // Fetch summary data for the sidebar
  const { data: summaryData } = useSuperAdminBookingDashboard();

  // Fetch bookings data with pagination
  const {
    data: bookingsData,
    isLoading,
    error,
  } = useAdminBookings({
    page,
    limit: 5, // Show 5 recent bookings on dashboard
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

  const handleViewBooking = (booking: BookingWithRelations) => {
    // TODO: Open modal or navigate to detail page
    console.log("View booking:", booking.bookingCode);
  };

  return (
    <div className="flex flex-row gap-6 w-full">
      {isLoading ? (
        <BookingTableLoading />
      ) : bookings.length === 0 ? (
        <div className="flex-1 rounded-2xl border border-[#E9EAEB] p-8 text-center">
          <p className="text-muted-foreground">No bookings found</p>
        </div>
      ) : (
        <BookingTable
          bookings={bookings}
          paginationInfo={paginationInfo}
          onPageChange={handlePageChange}
          onViewBooking={handleViewBooking}
        />
      )}

      <div className="bg-card border-[1.5px] border-border/50 rounded-xl max-w-[360px] w-[360px] h-fit flex-1">
        <div className="flex flex-col">
          <div className="flex flex-col gap-5 border-b border-border pb-5 pt-5 px-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Summary Booking
                </h3>
                <p className="text-sm font-normal text-muted-foreground overflow-ellipsis overflow-hidden whitespace-nowrap">
                  Semua venue
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            {!summary ? (
              <SummarySkeleton />
            ) : (
              summaryItems.map((item, index) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex gap-4 items-start px-4 py-8",
                    index !== summaryItems.length - 1 &&
                      "border-b border-border"
                  )}
                >
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-foreground">
                      {item.label}
                    </p>
                  </div>
                  <div className="flex-1 flex flex-col items-start pl-5 pr-0 py-0">
                    <p className="text-sm font-normal text-foreground text-right w-full">
                      {formatCount(item.value)}
                    </p>
                  </div>
                </div>
              ))
            )}
            {error && !summary && (
              <p className="text-sm text-destructive px-4 py-4 border-t border-border">
                Gagal memuat ringkasan booking:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
