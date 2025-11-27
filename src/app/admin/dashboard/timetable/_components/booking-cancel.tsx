"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Info, XIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

{
  /*Import Modal*/
}
import { stringUtils } from "@/lib/format/string";
import { formatTimeDisplay } from "@/components/timetable-utils";
import { format } from "path";
import { id } from "date-fns/locale";


type CancelBookingDetailProps = {
  id: string;
  venueName: string; 
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
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
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
export function CancelBookingDetail ({
  open,
  onOpenChange,
  cancelBookingDetail,
  onCancelBooking,

}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    cancelBookingDetail: CancelBookingDetailProps | null;
    onCancelBooking: (id: string) => void;
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
                  <span>Cancel Booking</span> 
                  <span className="text-sm text-muted-foreground font-normal">
                    This action will permanently cancel this booking. Please review the details before confirming.
                  </span>
              </div>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col mt-2 space-y-2 text-muted-foreground">
                <span>Venue</span>
                <span>Court</span>
                <span>Date</span>
                <span>Time</span>
                <span>Duration</span>
              </div>
              <div className="flex flex-col mt-2 space-y-2 font-medium">
                <span>{cancelBookingDetail?.venueName || ""}</span>
                <span>{cancelBookingDetail?.courtName || ""}</span>
                <span>{formatDate(cancelBookingDetail?.bookingDate || new Date()) || ""}</span>
                <span>{formatTimeRange(cancelBookingDetail?.timeSlots || []) || ""}</span>
                <span>{cancelBookingDetail?.duration || ""} hours</span>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 p-4 rounded-sm text-foreground border-[#C3D223]"
              >
                Keep Booking
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1 p-4 rounded-sm text-foreground"
              >
                Cancel
              </Button>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  )}
