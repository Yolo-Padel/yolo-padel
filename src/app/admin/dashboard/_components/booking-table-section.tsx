"use client";

import { cn } from "@/lib/utils";
import { BookingTable } from "@/app/admin/dashboard/booking/_components/booking-table";
import { useSuperAdminBookingDashboard } from "@/hooks/use-booking";
import { Skeleton } from "@/components/ui/skeleton";

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
  const { data, isLoading, error } = useSuperAdminBookingDashboard();

  const summary = data?.data?.bookingSummary;

  const summaryData = [
    { label: "Total Bookings", value: summary?.total },
    { label: "Completed", value: summary?.completed },
    { label: "Ongoing", value: summary?.ongoing },
    { label: "Upcoming", value: summary?.upcoming },
    { label: "Cancelled", value: summary?.cancelled },
    { label: "Expired Payment", value: summary?.expiredPayment },
  ];

  return (
    <div className="flex flex-row gap-6 w-full">
      <BookingTable showAddButton={false} />

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
            {isLoading && !summary ? (
              <SummarySkeleton />
            ) : (
              summaryData.map((item, index) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex gap-4 items-start px-4 py-8",
                    index !== summaryData.length - 1 && "border-b border-border"
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
