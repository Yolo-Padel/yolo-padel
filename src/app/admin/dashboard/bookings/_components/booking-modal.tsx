"use client";

import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { XIcon } from "lucide-react";
import { SeeBookingDetails } from "@/app/dashboard/booking/_components/booking-details";

type BookingModalProps = {
  id: string;
  venue: string;
  courtName: string;
  image?: string;
  bookingTime?: string;
  bookingDate: string;
  duration: string;
  totalPayment: number;
  status: string | "Upcoming" | "Expired" | "Completed";
  paymentMethod: string | "Credit Card" | "QRIS" | "Bank Transfer";
  paymentStatus: string | "Paid" | "Unpaid";
};

export function BookingModal({
  open,
  onOpenChange,
  bookingModalProps,
  onChangeMode,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bookingModalProps: BookingModalProps | null;
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
      <DialogContent showCloseButton={false} className="p-8">
        <XIcon
          className="absolute top-8 right-6 cursor-pointer bg-primary rounded-full p-1"
          onClick={() => onOpenChange(false)}
        />

        {/*Booking Details Modal*/}
        <SeeBookingDetails
          open={open}
          onOpenChange={onOpenChange}
          bookingDetails={bookingModalProps}
          onChangeMode={onChangeMode}
        />
      </DialogContent>
    </Dialog>
  );
}
