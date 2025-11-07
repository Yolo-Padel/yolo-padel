"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Order } from "@/hooks/use-order";
import { PaymentStatus } from "@/types/prisma";
import { X } from "lucide-react";

export function PaymentInstructionContainer({
  onOpenChange,
  paymentInstructionProps,
  onChangeMode,
}: {
  onOpenChange: (open: boolean) => void;
  paymentInstructionProps: Order | null;
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
          src="/qris.png"
          alt="barcode"
          className="w-[full] h-[full] rounded-md mx-auto"
        />

        <div className="flex flex-col items-center gap-2 text-sm text-foreground">
          <div>
            Total Payment Rp{" "}
            {paymentInstructionProps?.totalAmount.toLocaleString("id-ID")}
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
          <Button
            className="w-full rounded-sm"
            variant="default"
            onClick={() => {
              onChangeMode("payment-status");
            }}
          >
            Payment Status
          </Button>
        </div>
      </div>
    </div>
  );
}
