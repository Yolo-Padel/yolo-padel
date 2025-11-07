"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
{
  /*Import Modal*/
}
import { SeeBookingDetails } from "./booking-details";
import { BookingSummary } from "./booking-summary";
import { Payment } from "./booking-payment";
import { SuccessPayment } from "./booking-paid";
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
      | "booking-payment"
  ) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={bookingModalProps?.id}>
      <DialogTitle className="sr-only" aria-hidden="true">
        Booking Details
      </DialogTitle>
      <DialogContent showCloseButton={false} className="p-8">
        <XIcon
          className="absolute top-8 right-6 cursor-pointer bg-primary rounded-full p-1"
          onClick={() => onOpenChange(false)}
        />

        {/*Booking Details Modal*/}
        {mode === "booking-details" && (
          <SeeBookingDetails
            open={open}
            onOpenChange={onOpenChange}
            bookingDetails={bookingModalProps}
            onChangeMode={onChangeMode}
          />
        )}

        {/*Order Summary Modal*/}
        {mode === "book-again" && (
          <BookingSummary
            open={open}
            onOpenChange={onOpenChange}
            bookingSummaryProps={bookingModalProps}
            onChangeMode={onChangeMode}
          />
        )}

        {/*Booking Payment Modal*/}
        {mode === "booking-payment" && (
          <Payment
            open={open}
            onOpenChange={onOpenChange}
            paymentProps={bookingModalProps}
            onChangeMode={onChangeMode}
          />
        )}

        {/*Payment Paid Modal*/}
        {mode === "payment-paid" && (
          <SuccessPayment
            open={open}
            onOpenChange={onOpenChange}
            successPaymentProps={bookingModalProps}
            onChangeMode={onChangeMode}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
