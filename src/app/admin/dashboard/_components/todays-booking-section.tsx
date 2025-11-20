"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminBookingDashboard } from "@/hooks/use-booking";
import { formatCurrency } from "@/lib/order-utils";
import { formatTimeRange } from "@/lib/time-slots-formatter";
import { BookingStatus } from "@/types/prisma";
import { Skeleton } from "@/components/ui/skeleton";

const totalFormatter = new Intl.NumberFormat("id-ID");

function formatDateLabel(dateInput?: string | Date | null) {
  if (!dateInput) return "-";
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadgeClass(status: BookingStatus) {
  switch (status) {
    case BookingStatus.UPCOMING:
      return "bg-[#fffaeb] border-[#fedf89] text-[#b54708]";
    case BookingStatus.PENDING:
      return "bg-[#fff5d5] border-[#f2c067] text-[#a15c08]";
    case BookingStatus.COMPLETED:
      return "bg-[#eff8ff] border-[#b2ddff] text-[#175cd3]";
    case BookingStatus.CANCELLED:
    case BookingStatus.NO_SHOW:
      return "bg-[#fef3f2] border-[#fecdca] text-[#b42318]";
    default:
      return "bg-gray-200 border-gray-300 text-gray-700";
  }
}

function getStatusLabel(status: BookingStatus) {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function getDurationLabel(
  timeSlots: Array<{ openHour: string; closeHour: string }>
) {
  if (!timeSlots.length) return "-";
  const start = timeSlots[0].openHour;
  const end = timeSlots[timeSlots.length - 1].closeHour;

  const [sHour, sMin] = start.split(":").map(Number);
  const [eHour, eMin] = end.split(":").map(Number);

  const durationMinutes = eHour * 60 + eMin - (sHour * 60 + sMin);
  if (durationMinutes <= 0) {
    return `${timeSlots.length} slot`;
  }
  return `${durationMinutes} min slot`;
}

function formatTotalBadgeValue(value?: number | null) {
  if (value === undefined || value === null) return "0";
  return totalFormatter.format(value);
}

function TodaysBookingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 px-6 py-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={`booking-skeleton-${index}`}
          className="border border-[#d1d1d1] rounded-lg p-4"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function TodaysBookingSection() {
  const { data, isLoading, error } = useAdminBookingDashboard();

  const todaysBookings = data?.data?.todaysBookings.items ?? [];
  const totalToday = data?.data?.todaysBookings.total ?? 0;

  const showEmptyState = !isLoading && todaysBookings.length === 0;

  return (
    <div className="bg-card border-[1.5px] border-border/50 rounded-xl w-full">
      <div className="flex flex-col">
        <div className="flex flex-col gap-5 border-b border-border pb-5 pt-5 px-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <div className="flex gap-2 items-center">
                <h3 className="text-lg font-semibold text-foreground">
                  Today's Booking
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 pb-4 pt-4 px-6">
          <div className="flex gap-4 items-center">
            <h4 className="text-lg font-semibold text-foreground">
              Total Booking
            </h4>
            {isLoading ? (
              <Skeleton className="h-6 w-16 rounded-full" />
            ) : (
              <Badge className="bg-[#f9f5ff] border border-[#e9d7fe] text-[#6941c6]">
                {formatTotalBadgeValue(totalToday)}
              </Badge>
            )}
          </div>
        </div>

        {isLoading ? (
          <TodaysBookingSkeleton />
        ) : showEmptyState ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            Tidak ada booking untuk hari ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6 py-3">
            {todaysBookings.map((booking) => (
              <Card
                key={booking.id}
                className="border border-[#d1d1d1] rounded-lg p-4"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn(
                        "border font-medium",
                        getStatusBadgeClass(booking.status)
                      )}
                    >
                      {getStatusLabel(booking.status)}
                    </Badge>
                    <div className="flex gap-1 items-center">
                      <CalendarDays className="size-4 text-foreground" />
                      <p className="text-xs font-normal text-foreground">
                        {formatDateLabel(booking.bookingDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      #{booking.bookingCode}
                    </p>
                    <p className="text-base font-semibold text-foreground">
                      {booking.customerName} • {booking.courtName}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {formatTimeRange(booking.timeSlots)}
                    </p>
                    <p className="text-sm font-normal text-muted-foreground">
                      {getDurationLabel(booking.timeSlots)}
                    </p>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-lg font-semibold text-foreground">
                      {formatCurrency(booking.totalPrice)}
                    </p>
                  </div>

                  <Button className="bg-[#ecf1bb] text-[#6b7413] hover:bg-[#ecf1bb]/90 shadow-sm h-9">
                    View Booking
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <p className="px-6 pb-6 text-sm text-destructive">
            Gagal memuat booking hari ini:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        )}
      </div>
    </div>
  );
}
