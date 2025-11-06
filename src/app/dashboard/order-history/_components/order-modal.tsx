"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { SeeOrderDetails } from "./order-details";
import { PayNow } from "./pay-now";
import { OrderSuccess } from "./order_success";
import { OrderPending } from "./order_pending";
import { ChangePaymentMethod } from "./select-payment-method";
import { ConfirmPaymentMethod } from "./confirm-payment-method";
import { Order } from "@/hooks/use-order";

export function OrderModal({
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
    | "details-payment"
    | "paynow"
    | "payment-success"
    | "payment-pending"
    | "view-booking"
    | "change-method"
    | "confirm-method";
  onChangeMode: (
    mode:
      | "details-payment"
      | "paynow"
      | "payment-success"
      | "payment-pending"
      | "view-booking"
      | "change-method"
      | "confirm-method"
  ) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={orderProps?.id}>
      <DialogTitle className="sr-only" aria-hidden="true">
        Order Details
      </DialogTitle>
      <DialogContent showCloseButton={false}>
        {/*Pay Now Content Modal*/}
        {mode === "paynow" && (
          <div>
            <PayNow
              open={open}
              onOpenChange={onOpenChange}
              payNowProps={orderProps}
              onChangeMode={onChangeMode}
            />
          </div>
        )}

        {/*See Details Content Modal*/}
        {mode === "details-payment" && (
          <div>
            <SeeOrderDetails
              onOpenChange={onOpenChange}
              orderDetails={orderProps}
              onChangeMode={onChangeMode}
              mode={mode}
            />
          </div>
        )}

        {/* On Payment Success*/}
        {mode === "payment-success" && (
          <div>
            <OrderSuccess
              open={open}
              onOpenChange={onOpenChange}
              paymentProps={orderProps}
              onChangeMode={onChangeMode}
            />
          </div>
        )}

        {/* On Payment Pending*/}
        {mode === "payment-pending" && (
          <div>
            <OrderPending
              open={open}
              onOpenChange={onOpenChange}
              paymentProps={orderProps}
            />
          </div>
        )}

        {/* Change Method Payment*/}
        {mode === "change-method" && (
          <div>
            <ChangePaymentMethod
              open={open}
              onOpenChange={onOpenChange}
              paymentMethodProps={orderProps}
              onChangeMode={onChangeMode}
            />
          </div>
        )}

        {/* Confirm Method Payment*/}
        {mode === "confirm-method" && (
          <div>
            <ConfirmPaymentMethod
              open={open}
              onOpenChange={onOpenChange}
              paymentMethodProps={orderProps}
              onChangeMode={onChangeMode}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
