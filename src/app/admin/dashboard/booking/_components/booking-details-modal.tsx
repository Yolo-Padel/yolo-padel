"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SeeBookingDetails } from "@/app/dashboard/booking/_components/booking-details";
import { BookingStatus } from "@/types/prisma";
import { formatTimeRange } from "@/lib/time-slots-formatter";

// Type definition matching the booking service response structure
type BookingWithRelations = {
  id: string;
  bookingCode: string;
  source: string;
  bookingDate: Date;
  duration: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
  timeSlots: {
    id: string;
    openHour: string;
    closeHour: string;
  }[];
  user: {
    id: string;
    email: string;
    profile: {
      fullName: string;
      avatar: string | null;
    } | null;
  };
  court: {
    id: string;
    name: string;
    venue: {
      id: string;
      name: string;
      city: string;
      images?: string[];
    };
  };
};

type BookingDetails = {
  id: string;
  venue: string;
  source: string;
  courtName: string;
  image?: string;
  bookingTime?: string;
  bookingDate: string;
  duration: string;
  status: BookingStatus;
};

interface BookingDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: BookingWithRelations | null;
}

/**
 * Transform BookingWithRelations data to BookingDetails format
 * Safely handles null/undefined values in nested data
 */
function transformBookingData(
  booking: BookingWithRelations | null,
): BookingDetails | null {
  if (!booking) return null;

  return {
    id: booking.bookingCode || booking.id,
    venue: booking.court?.venue?.name || "N/A",
    source: booking.source || "N/A",
    courtName: booking.court?.name || "N/A",
    image: booking.court?.venue?.images?.[0],
    bookingTime: formatTimeRange(booking.timeSlots || []),
    bookingDate: booking.bookingDate
      ? typeof booking.bookingDate === "string"
        ? booking.bookingDate
        : booking.bookingDate.toISOString()
      : new Date().toISOString(),
    duration: `${booking.duration || 0} hour${booking.duration > 1 ? "s" : ""}`,
    status: booking.status || BookingStatus.PENDING,
  };
}

export function BookingDetailsModal({
  open,
  onOpenChange,
  booking,
}: BookingDetailsModalProps) {
  const bookingDetails = transformBookingData(booking);

  // No-op function for onChangeMode since admin doesn't need "Book Again"
  const handleChangeMode = () => {
    // Admin context - no action needed
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only" aria-hidden="true">
        Booking Details
      </DialogTitle>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        showCloseButton={false}
      >
        <SeeBookingDetails
          open={open}
          onOpenChange={onOpenChange}
          bookingDetails={bookingDetails}
          onChangeMode={handleChangeMode}
        />
      </DialogContent>
    </Dialog>
  );
}
