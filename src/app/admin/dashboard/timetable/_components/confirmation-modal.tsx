"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatTimeDisplay } from "@/components/timetable-utils";

type ConfirmBookingModalProps = {
  id: string;
  venueName: string;
  bookingCode: string;
  courtName: string;
  timeSlots: Array<{
    openHour: string;
    closeHour: string;
  }>;
  bookingDate: Date;
  duration: number;
};

// Format tanggal: "14 Oktober 2025"
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

// Format time range: ["06:00", "07:00"] -> "06.00-07.00"
function formatTimeRange(
  timeSlots: Array<{ openHour: string; closeHour: string }>
): string {
  if (timeSlots.length === 0) return "";
  const first = timeSlots[0];
  const last = timeSlots[timeSlots.length - 1];
  // Format seperti "06.00-07.00" (tanpa AM/PM)
  return `${formatTimeDisplay(first.openHour)}-${formatTimeDisplay(last.closeHour)}`;
}
export function ConfirmBookingModal({
  open,
  onOpenChange,
  booking,
  onCompleteBooking,
  isLoading = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  booking: ConfirmBookingModalProps | null;
  onCompleteBooking: () => void;
  isLoading?: boolean;
}) {
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
        <div className="rounded-md">
          <DialogHeader className="pr-12">
            <DialogTitle className="text-2xl font-bold">
              <div className="flex flex-col gap-2">
                <span>Complete this Booking</span>
                <span className="text-sm text-muted-foreground font-normal">
                  This action will complete this booking. Please review the
                  details before confirming.
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 p-4 rounded-sm text-foreground border-[#C3D223]"
              disabled={isLoading}
            >
              Keep this Booking
            </Button>
            <Button
              onClick={onCompleteBooking}
              className="flex-1 p-4 rounded-sm text-white bg-destructive hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Completing..." : "Complete Booking"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
