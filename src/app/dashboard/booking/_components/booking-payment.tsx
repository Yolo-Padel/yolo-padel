"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { BookingStatus } from "@/types/prisma";
import { stringUtils } from "@/lib/format/string";

type PaymentProps = {
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

export function Payment({
  open,
  onOpenChange,
  paymentProps,
  onChangeMode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentProps: PaymentProps | null;
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
    <div>
      <div className="flex gap-4">
        <Button
          className="bg-primary w-12 h-8 mt-1"
          onClick={() => onOpenChange(false)}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold">Finish this Payment</h2>
          <span className="font-normal text-sm text-muted-foreground pt-2">
            {paymentProps?.bookingDate}
          </span>
        </div>
      </div>
      <div className="text-xl gap-4 mt-4 space-y-6 items-center ">
        <img
          src="/qris.png"
          alt="barcode"
          className="w-[full] h-[full] rounded-md mx-auto"
        />

        <div className="flex flex-col items-center gap-2 text-sm text-foreground">
          <div>
            Total Payment{" "}
            {paymentProps?.totalPayment
              ? stringUtils.formatRupiah(paymentProps.totalPayment)
              : "N/A"}
          </div>
          <div>Expires in 15 minutes</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-2">
          <Button
            className="w-full border-primary rounded-sm"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Download QRIS
          </Button>

          {/*Payment Confirmed*/}
          {paymentProps?.status === BookingStatus.CONFIRMED && (
            <Button
              className="w-full rounded-sm border-primary"
              variant="outline"
              onClick={() => {
                onChangeMode("payment-paid");
              }}
            >
              Payment Status
            </Button>
          )}

          {/*Payment Completed*/}
          {paymentProps?.status === BookingStatus.COMPLETED && (
            <Button
              className="w-full rounded-sm border-primary"
              variant="outline"
              onClick={() => {
                onChangeMode("payment-paid");
              }}
            >
              Payment Status
            </Button>
          )}

          {/*Payment Pending*/}
          {paymentProps?.status === BookingStatus.PENDING && (
            <Button
              className="w-full rounded-sm border-primary"
              variant="outline"
              onClick={() => {
                onChangeMode("payment-pending");
              }}
            >
              Payment Status
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
