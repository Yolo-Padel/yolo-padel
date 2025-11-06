"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Order } from "@/hooks/use-order";
import { PaymentStatus } from "@/types/prisma";
import { X } from "lucide-react";

export function PayNow({
  open,
  onOpenChange,
  payNowProps,
  onChangeMode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payNowProps: Order | null;
  onChangeMode: (
    mode:
      | "details-payment"
      | "paynow"
      | "payment-success"
      | "payment-pending"
      | "view-booking"
  ) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-1">
        <div className="relative flex flex-row">
          <div className="space-y-2 text-2xl">
            Complete Your Payment
            <p className="font-normal text-sm text-muted-foreground pt-2">
              Scan this QR code using your mobile banking or e-wallet app to
              complete your payment.
            </p>
          </div>
          <Button
            className="bg-primary rounded-full"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="text-xl gap-4 mt-4 space-y-6 items-center">
        <img
          src="/scan_me_qr_code.jpg"
          alt="barcode"
          className="w-[full] h-[full] rounded-md"
        />

        <div className="flex flex-col items-center gap-2 text-sm text-foreground">
          <div>
            Total Payment Rp {payNowProps?.totalAmount.toLocaleString("id-ID")}
          </div>
          <div>Expires in X minutes</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-2">
          <Button
            className="w-full border-primary rounded-sm"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          {/*Payment Paid*/}
          {payNowProps?.payment?.status === PaymentStatus.PAID && (
            <Button
              className="w-full rounded-sm"
              variant="default"
              onClick={() => {
                onChangeMode("payment-success");
              }}
            >
              Payment Status
            </Button>
          )}

          {/*Payment Pending*/}
          {payNowProps?.payment?.status === PaymentStatus.PENDING && (
            <Button
              className="w-full rounded-sm"
              variant="default"
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
