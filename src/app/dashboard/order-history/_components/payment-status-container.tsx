"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dot } from "lucide-react";
import { Order } from "@/hooks/use-order";
import { stringUtils } from "@/lib/format/string";

export function PaymentStatusContainer({
  onOpenChange,
  paymentProps,
  onChangeMode,
}: {
  onOpenChange: (open: boolean) => void;
  paymentProps: Order | null;
  onChangeMode: (
    mode:
      | "order-details"
      | "payment-instruction"
      | "payment-status"
      | "view-booking"
      | "change-payment-method"
  ) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header*/}
      <span className="text-2xl font-semibold">Payment Status</span>
      {/* Content*/}
      <div className="text-center flex flex-col items-center gap-4">
        {/* Content Image*/}
        <div className="flex flex-col items-center gap-4">
          <img
            src="/payment-success.svg"
            className="w-[100px] h-[100px] mx-auto"
          />
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg text-foreground font-semibold">
              Payment Successful
            </span>
            <span className="text-sm text-muted-foreground font-normal mx-6">
              Your payment has been received and your booking is confirmed.
            </span>
          </div>
          {/* Content Info*/}
          <div className="grid grid-cols-2 w-full border border-primary rounded-md p-4 px-auto gap-2 place-items-center">
            <div className="flex flex-col items-start gap-1">
              <div className="flex min-w-0 truncate items-center text-foreground font-normal">
                {paymentProps?.bookings[0]?.court?.name}
                <Dot width={12} height={18} strokeWidth={4} />
                {paymentProps?.bookings[0]?.court?.venue?.name}
              </div>
              <span className="text-foreground font-normal">
                {paymentProps?.bookings[0]?.timeSlots[0]?.openHour} -{" "}
                {paymentProps?.bookings[0]?.timeSlots[0]?.closeHour}
              </span>
              <span className="text-foreground font-normal">
                Payment Method
              </span>
              <span className="text-foreground font-normal">Total Payment</span>
            </div>

            <div className="flex flex-col items-end gap-1 font-normal">
              <span> {paymentProps?.bookings[0]?.bookingDate}</span>
              <span> {paymentProps?.bookings[0]?.duration} hours</span>
              <span> {paymentProps?.payment?.channelName}</span>
              <span>{paymentProps?.payment?.amount ? stringUtils.formatRupiah(paymentProps.payment.amount) : "N/A"}</span>
            </div>
          </div>
          <span className="text-muted-foreground font-normal mx-12">
            An e-receipt has been sent to your email. Please check in at the
            front desk upon arrival.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-2">
          <Button
            className="w-full border-primary rounded-sm"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Download Receipt
          </Button>
          <Button
            onClick={() => onChangeMode("view-booking")}
            variant="default"
            className="w-full bg-primary text-primary-foreground"
          >
            View Booking
          </Button>
        </div>
      </div>
    </div>
  );
}
