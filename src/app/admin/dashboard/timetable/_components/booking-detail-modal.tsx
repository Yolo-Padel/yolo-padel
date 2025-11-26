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
import { X } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { stringUtils } from "@/lib/format/string";
import { PaymentStatus } from "@/types/prisma";
import { CancelBookingDetail } from "./booking-cancel";
import { formatTimeRange } from "@/components/timetable-utils";

// Extended booking type dengan payment info
export type BookingDetail = {
  id: string;
  bookingCode: string;
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
  onMarkAsComplete?: () => void;
  onCancelBooking?: () => void;
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

export function BookingDetailModal({
  open,
  onOpenChange,
  booking,
  onMarkAsComplete,
  onCancelBooking,
}: BookingDetailModalProps) {
  if (!booking) return null;

  const handleCancelBooking = React.useCallback(() => {
    if (onCancelBooking) {
      onCancelBooking();
    }
  }, [onCancelBooking]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" showCloseButton={false}>
        {/* Custom Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 size-8 rounded-full bg-[#C3D223] hover:bg-[#A9B920]"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </Button>

        <DialogHeader className="pr-12">
          <DialogTitle className="text-2xl font-bold">
            Booking Detail
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
              <span className="font-medium">#{booking.bookingCode}</span>
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
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{booking.duration} hrs</span>
              </div>
            </div>
          </div>

          {/* Payment Info Section */}
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
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">{booking.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    getPaymentStatusBadgeClass(booking.paymentStatus)
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 border-[#C3D223] text-foreground"
              onClick={() => {
                onOpenChange(false);
                onCancelBooking?.();
              }}
            >
              Cancel
            </Button>
            {onMarkAsComplete &&
              booking.paymentStatus === PaymentStatus.PAID && (
                <Button
                  className="flex-1 bg-[#C3D223] hover:bg-[#A9B920] text-white"
                  onClick={onMarkAsComplete}
                >
                  Mark as Complete
                </Button>
              )}
            {onMarkAsComplete &&
              booking.paymentStatus === PaymentStatus.UNPAID && (
                <Button
                  className="flex-1 bg-[#C3D223] hover:bg-[#A9B920] text-white"
                  onClick={() => onOpenChange(true)}
                >
                  Mark as Complete
                </Button>
              )}
          </div>
        </div>
      </DialogContent>
      <CancelBookingDetail
        open={open}
        onOpenChange={onOpenChange}
        cancelBookingDetail={booking}
        onCancelBooking={handleCancelBooking}
      />
    </Dialog>
  );
}
