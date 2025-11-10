"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SeeBookingDetails } from "@/app/dashboard/booking/_components/booking-details";
import { BookingStatus, PaymentStatus } from "@/types/prisma";
import { formatTimeRange } from "@/lib/time-slots-formatter";

// Type definition matching the booking service response structure
type BookingWithRelations = {
  id: string;
  bookingCode: string;
  bookingDate: Date;
  duration: number;
  totalPrice: number;
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
  order: {
    id: string;
    orderCode: string;
    status: string;
    totalAmount: number;
  } | null;
  payments: {
    id: string;
    amount: number;
    status: PaymentStatus;
    paymentDate: Date | null;
    channelName: string;
  }[];
};

type BookingDetails = {
  id: string;
  venue: string;
  courtName: string;
  image?: string;
  bookingTime?: string;
  bookingDate: string;
  duration: string;
  totalPayment: number;
  status: BookingStatus;
  paymentMethod: string | "Credit Card" | "PayPal" | "Bank Transfer" | "QRIS";
  paymentStatus: PaymentStatus;
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
  booking: BookingWithRelations | null
): BookingDetails | null {
  if (!booking) return null;

  // Get the first payment, or use default values if no payments exist
  const payment = booking.payments?.[0];

  return {
    id: booking.bookingCode || booking.id,
    venue: booking.court?.venue?.name || "N/A",
    courtName: booking.court?.name || "N/A",
    image: booking.court?.venue?.images?.[0],
    bookingTime: formatTimeRange(booking.timeSlots || []),
    bookingDate: booking.bookingDate
      ? typeof booking.bookingDate === "string"
        ? booking.bookingDate
        : booking.bookingDate.toISOString()
      : new Date().toISOString(),
    duration: `${booking.duration || 0} hour${booking.duration > 1 ? "s" : ""}`,
    totalPayment: booking.totalPrice || 0,
    status: booking.status || BookingStatus.PENDING,
    paymentMethod: payment?.channelName || "N/A",
    paymentStatus: payment?.status || PaymentStatus.PENDING,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
