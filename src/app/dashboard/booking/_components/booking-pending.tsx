"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dot, ArrowLeftIcon } from "lucide-react";
import { BookingStatus } from "@/types/prisma";

/**
 * TO BE DEPRECATED
 * This component is no longer used and will be removed in the future
 */

type PendingPaymentProps = {
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
  paymentStatus: string | "Paid" | "Unpaid";
};

export function PendingPayment({
  open,
  onOpenChange,
  pendingPaymentProps,
  onChangeMode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingPaymentProps: PendingPaymentProps | null;
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
    <div className="flex flex-col gap-8">
      {/* Header*/}

      <div className="flex items-center gap-4">
        <Button
          className="items-center justify-center w-12 h-8 rounded-md"
          variant="default"
          onClick={() => {
            onChangeMode("booking-payment");
          }}
        >
          {" "}
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>

        <span className="font-semibold text-xl"> Waiting for Payment </span>
      </div>

      {/* Content*/}
      <div className="text-center flex flex-col items-center gap-4">
        {/* Content Image*/}
        <div className="flex flex-col items-center gap-4">
          <img
            src="/payment-waiting.svg"
            className="w-[100px] h-[100px] mx-auto"
          />
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg text-foreground font-semibold">
              Waiting for Payment
            </span>
            <span className="text-sm text-muted-foreground font-normal mx-4">
              We're waiting for your payment to be completed. Once confirmed,
              your booking will be secured automatically.
            </span>
          </div>

          {/* Content Info*/}
          <div className="grid grid-cols-2 w-full border border-primary rounded-md p-4 px-auto gap-2 place-items-center">
            <div className="flex flex-col items-start gap-1">
              <div className="flex min-w-0 truncate items-center text-foreground font-normal">
                {pendingPaymentProps?.courtName}
                <Dot width={12} height={18} strokeWidth={4} />
                {pendingPaymentProps?.venue}
              </div>
              <span className="text-foreground font-normal">
                {pendingPaymentProps?.bookingTime}
              </span>
              <span className="text-foreground font-normal">
                Payment Method
              </span>
              <span className="text-foreground font-normal">Total Payment</span>
            </div>

            <div className="flex flex-col items-end gap-1 font-normal">
              <span> {pendingPaymentProps?.bookingDate}</span>
              <span> {pendingPaymentProps?.duration}</span>
              <span> {pendingPaymentProps?.paymentMethod}</span>
              <span>Rp {pendingPaymentProps?.totalPayment}</span>
            </div>
          </div>
          <span className="text-sm text-muted-foreground font-normal mx-4">
            Make sure to transfer the exact amount shown above. Your booking
            will be confirmed automatically once payment is received.
          </span>
        </div>

        <div className="w-full gap-2">
          <Button
            className="w-full bg-primary border-primary rounded-sm"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
