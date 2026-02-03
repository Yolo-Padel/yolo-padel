"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Info, Clock } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { stringUtils } from "@/lib/format/string";
import { getBookingSourceDisplayLabel } from "@/lib/format/booking-source";
import { BookingStatus, PaymentStatus } from "@/types/prisma";
import { formatTimeRange } from "@/components/timetable-utils";
import { useCountdown } from "@/hooks/use-countdown";
import {
  createBookingStartDateTime,
  isBookingUpcomingToday,
} from "@/lib/booking-time-utils";

// Extended booking type dengan payment info
export type BookingDetail = {
  id: string;
  status: BookingStatus;
  bookingCode: string;
  source: string;
  userName: string;
  venueName: string;
  courtName: string;
  bookingDate: Date;
  timeSlots: Array<{
    openHour: string;
    closeHour: string;
  }>;
  duration: number; // dalam jam
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  createdAt: Date;
};

type BookingDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingDetail | null;
  onConfirmMarkAsCompleteBooking: () => void;
  onConfirmMarkAsNoShowBooking: () => void;
};

// Format waktu: "06:00" -> "06.00"
function formatTimeDisplay(time: string): string {
  return time.replace(":", ".");
}

// Format waktu dengan AM/PM: "06:00" -> "06.00AM"
function formatTimeWithAMPM(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${String(displayHour).padStart(2, "0")}.${minutes}${ampm}`;
}

// Format time range: ["06:00", "07:00"] -> "06.00-07.00"
// function formatTimeRange(
//   timeSlots: Array<{ openHour: string; closeHour: string }>
// ): string {
//   if (timeSlots.length === 0) return "";
//   const first = timeSlots[0];
//   const last = timeSlots[timeSlots.length - 1];
//   // Format seperti "06.00-07.00" (tanpa AM/PM)
//   return `${formatTimeDisplay(first.openHour)}-${formatTimeDisplay(last.closeHour)}`;
// }

// Format tanggal: "14 Oktober 2025"
function formatDate(date: Date): string {
  return format(date, "d MMM yyyy", { locale: id });
}

// Format tanggal dan waktu: "14 Oktober 2025, 14.07"
function formatDateTime(date: Date): string {
  const dateStr = formatDate(date);
  const timeStr = format(date, "HH.mm");
  return `${dateStr}, ${timeStr}`;
}

// Get payment status badge styling
function getPaymentStatusBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.PAID:
      return "bg-[#D0FBE9] text-[#1A7544]";
    case PaymentStatus.UNPAID:
      return "bg-[#FFF4D5] text-[#8B6F00]";
    case PaymentStatus.FAILED:
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    case PaymentStatus.EXPIRED:
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    default:
      return "bg-gray-200 text-gray-700";
  }
}

function getBookingStatusBadgeClass(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.UPCOMING:
      return "bg-[#D0FBE9] text-[#1A7544]";
    case BookingStatus.PENDING:
      return "bg-[#FFF4D5] text-[#8B6F00]";
    case BookingStatus.NO_SHOW:
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    case BookingStatus.COMPLETED:
      return "bg-blue-200 text-blue-800";
  }
  return "bg-gray-200 text-gray-700";
}

export function BookingDetailModal({
  open,
  onOpenChange,
  booking,
  onConfirmMarkAsCompleteBooking,
  onConfirmMarkAsNoShowBooking,
}: BookingDetailModalProps) {
  // Create target datetime for countdown - use fallback values when booking is null
  const bookingTimeString = booking ? formatTimeRange(booking.timeSlots) : "";
  const targetDateTime = booking
    ? createBookingStartDateTime(booking.bookingDate, bookingTimeString)
    : new Date();

  // Use countdown hook - must be called unconditionally
  const { timeLeft, isExpired } = useCountdown(targetDateTime);

  if (!booking) return null;

  // Check if we should show countdown (only for upcoming bookings today)
  const shouldShowCountdown =
    booking.status === BookingStatus.UPCOMING &&
    isBookingUpcomingToday(booking.bookingDate, bookingTimeString);

  // Debug logging (remove in production)
  console.log("Debug countdown logic:", {
    bookingStatus: booking.status,
    bookingDate: booking.bookingDate,
    bookingTimeString,
    targetDateTime,
    shouldShowCountdown,
    isUpcomingToday: isBookingUpcomingToday(
      booking.bookingDate,
      bookingTimeString,
    ),
    timeLeft,
    isExpired,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
        {/* Custom Close Button */}
        <Button
          size="icon"
          className="absolute top-4 right-4 size-8 rounded-full bg-brand hover:bg-brand/90 text-brand-foreground"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>

        <DialogHeader className="pr-12">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            Booking Detail{" "}
            <Badge
              className={cn(
                "rounded-sm px-3 text-xs font-medium",
                getBookingStatusBadgeClass(booking.status),
              )}
            >
              {stringUtils.getRoleDisplay(booking.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Court booking for this timeslot.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Info Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Booking Info</h3>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Booking Code</span>
              <span className="font-medium">{booking.bookingCode}</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{booking.userName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Venue</span>
                <span className="font-medium">{booking.venueName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Court</span>
                <span className="font-medium">{booking.courtName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {formatDate(booking.bookingDate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">
                  {formatTimeRange(booking.timeSlots)}
                </span>
              </div>
              {shouldShowCountdown && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>Game Starts in</span>
                  </div>
                  <span
                    className={`font-medium ${isExpired ? "text-green-600" : "text-blue-600"}`}
                  >
                    {timeLeft}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{booking.duration} hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Booking Source</span>
                <span className="font-medium">
                  {getBookingSourceDisplayLabel(booking.source)}
                </span>
              </div>
            </div>
          </div>

          {booking.source !== "ADMIN_MANUAL" && booking.source !== "AYO" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Payment Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium">
                    {stringUtils.formatRupiah(booking.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium",
                      getPaymentStatusBadgeClass(booking.paymentStatus),
                    )}
                  >
                    {booking.paymentStatus === PaymentStatus.PAID
                      ? "Paid"
                      : booking.paymentStatus}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Created On</span>
                  <span className="font-medium">
                    {formatDateTime(booking.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {booking.source === "AYO" && (
            <Badge className="rounded-md bg-[#ECF1BB] text-[#6B7413] p-4 text-sm font-normal">
              <Info className="w-6 h-6 mr-2 mb-5" />
              This booking was synced from AYO. Manage it in AYO Venue Manager.
            </Badge>
          )}

          {/* Action Buttons */}
          {booking.source !== "AYO" &&
            booking.status !== BookingStatus.COMPLETED &&
            booking.status !== BookingStatus.NO_SHOW && (
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 border border-primary bg-primary/20 text-black hover:bg-primary/50"
                  onClick={onConfirmMarkAsNoShowBooking}
                >
                  No Show
                </Button>
                <Button
                  className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
                  onClick={onConfirmMarkAsCompleteBooking}
                >
                  Check In
                </Button>
              </div>
            )}
          {(booking.status === BookingStatus.COMPLETED ||
            booking.status === BookingStatus.NO_SHOW) && (
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
