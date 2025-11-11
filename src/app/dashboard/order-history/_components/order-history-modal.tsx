"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { OrderDetailsContainer } from "./order-details-container";
import { PaymentInstructionContainer } from "./payment-instruction-container";
import { PaymentStatusContainer } from "./payment-status-container";
import { ChangePaymentMethodContainer } from "./change-payment-method-container";
import { Order } from "@/hooks/use-order";

export function OrderHistoryModal({
  open,
  onOpenChange,
  orderProps,
  mode,
  onChangeMode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderProps: Order | null;
  mode:
    | "order-details"
    | "payment-instruction"
    | "payment-status"
    | "view-booking"
    | "change-payment-method";
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
    <Dialog open={open} onOpenChange={onOpenChange} key={orderProps?.id}>
      <DialogTitle className="sr-only" aria-hidden="true">
        Order Details
      </DialogTitle>
      <DialogContent showCloseButton={false}>
        {/*Payment Instruction Content Modal*/}
        {mode === "payment-instruction" && (
          <div>
            <PaymentInstructionContainer
              onOpenChange={onOpenChange}
              paymentInstructionProps={orderProps}
              onChangeMode={onChangeMode}
            />
          </div>
        )}

        {/* Order Details Content Modal*/}
        {mode === "order-details" && (
          <div>
            <OrderDetailsContainer
              showButtons={true}
              onOpenChange={onOpenChange}
              orderDetails={orderProps}
              onChangeMode={onChangeMode}
              mode={mode}
            />
          </div>
        )}

        {/* Payment Status Content Modal*/}
        {mode === "payment-status" && (
          <div>
            <PaymentStatusContainer
              onOpenChange={onOpenChange}
              paymentProps={orderProps}
              onChangeMode={onChangeMode}
            />
          </div>
        )}

        {/* Change Payment Method Content Modal*/}
        {mode === "change-payment-method" && (
          <div>
            <ChangePaymentMethodContainer
              onOpenChange={onOpenChange}
              changePaymentMethodProps={orderProps}
              onChangeMode={onChangeMode}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
