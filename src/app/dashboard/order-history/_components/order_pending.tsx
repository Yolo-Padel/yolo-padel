"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Dot, X } from "lucide-react";
import { Order } from "@/hooks/use-order";

export function OrderPending({
  open,
  onOpenChange,
  paymentProps,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentProps: Order | null;
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
            src="/payment-waiting.svg"
            className="w-[100px] h-[100px] mx-auto"
          />
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg text-foreground font-semibold">
              Waiting for payment
            </span>
            <span className="text-sm text-muted-foreground font-normal mx-6">
              We're waiting for your payment to be completed. Once confirmed,
              your booking will be secured automatically.
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
              <span>Rp {paymentProps?.totalAmount}</span>
            </div>
          </div>

          <span className="text-sm text-muted-foreground font-normal mx-6">
            Make sure to transfer the exact amount shown above. Your booking
            will be confirmed automatically once payment is received.
          </span>
        </div>
        {/* Button Action*/}
        <div className="w-full">
          <Button
            onClick={() => onOpenChange(false)}
            variant="default"
            className="w-full bg-primary text-primary-foreground"
          >
            Cancel Payment
          </Button>
        </div>
      </div>
    </div>
  );
}
