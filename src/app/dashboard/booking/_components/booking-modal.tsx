"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { XIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
{
  /*Import Modal*/
}
import { SeeBookingDetails } from "./booking-details";
import { BookingSummary } from "./booking-summary";
import { Payment } from "./booking-payment";
import { SuccessPayment } from "./booking-paid";
import { PendingPayment } from "./booking-pending";
import { BookingStatus, PaymentStatus } from "@/types/prisma";

type BookingModalProps = {
  id: string;
  venue: string;
  courtName: string;
  image?: string;
  bookingTime?: string;
  bookingDate: string;
  duration: string;
  totalPayment: number;
  status: BookingStatus;
  paymentMethod: string | "Credit Card" | "QRIS" | "Bank Transfer";
  paymentStatus: PaymentStatus;
};

export function BookingModal({
  open,
  onOpenChange,
  bookingModalProps,
  mode,
  onChangeMode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bookingModalProps: BookingModalProps | null;
  mode:
    | "booking-details"
    | "order-summary"
    | "book-again"
    | "payment-paid"
    | "payment-pending"
    | "booking-payment";
  onChangeMode: (
    mode:
      | "booking-details"
      | "order-summary"
      | "book-again"
      | "payment-paid"
      | "payment-pending"
      | "booking-payment",
  ) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={bookingModalProps?.id}>
      <DialogTitle className="sr-only" aria-hidden="true">
        Booking Details
      </DialogTitle>
      <DialogContent showCloseButton={false} className="p-8">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-8 right-8 h-8 w-8 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>

        {/*Booking Details Modal*/}
        {mode === "booking-details" && (
          <SeeBookingDetails
            open={open}
            onOpenChange={onOpenChange}
            bookingDetails={bookingModalProps}
            onChangeMode={onChangeMode}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
