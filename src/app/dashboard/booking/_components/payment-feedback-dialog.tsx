"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { stringUtils } from "@/lib/format/string";

export type PaymentStatusResponse = {
  id: string;
  status: string;
  amount: number;
  paymentDate: string | null;
  expiredAt: string | null;
  order: {
    id: string;
    orderCode: string;
    status: string;
  } | null;
};

export type PaymentFeedbackState = {
  status: "success" | "failed";
  reason?: string;
  paymentId: string;
  payment?: PaymentStatusResponse;
  loading: boolean;
  error?: string | null;
};

const failureTitleMap: Record<string, string> = {
  expired: "Payment Expired",
  failed: "Payment Failed",
};

const failureMessageMap: Record<string, string> = {
  expired:
    "Payment was not completed before it expired. Please create a new order to try again.",
  failed:
    "Payment could not be processed. Please try again or choose a different method.",
};

export function PaymentFeedbackDialog({
  feedback,
  onClose,
  onViewOrders,
}: {
  feedback: PaymentFeedbackState | null;
  onClose: () => void;
  onViewOrders: () => void;
}) {
  if (!feedback) return null;

  const isSuccess = feedback.status === "success";
  const payment = feedback.payment;

  const failureTitle =
    failureTitleMap[feedback.reason ?? ""] || "Payment Not Completed";
  const failureMessage =
    failureMessageMap[feedback.reason ?? ""] ||
    "We could not confirm this payment. Please try again.";

  return (
    <Dialog
      open={!!feedback}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">
          Payment {isSuccess ? "Successful" : "Failed"}
        </DialogTitle>
        {feedback.loading ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Verifying payment status...
            </p>
          </div>
        ) : feedback.error ? (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-destructive">
              Unable to verify payment
            </h3>
            <p className="text-sm text-muted-foreground">{feedback.error}</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  isSuccess ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-600" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">
                  {isSuccess ? "Payment Successful" : failureTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isSuccess
                    ? "Your payment has been confirmed. See you on the court!"
                    : failureMessage}
                </p>
              </div>
            </div>

            {payment && (
              <div className="border rounded-lg p-4 space-y-2 bg-muted/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Code</span>
                  <span className="font-mono font-semibold">
                    {payment.order?.orderCode || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className="font-medium capitalize">
                    {payment.status.toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                  <span className="text-muted-foreground">Total Payment</span>
                  <span className="font-semibold">
                    {stringUtils.formatRupiah(payment.amount)}
                  </span>
                </div>
                {payment.paymentDate && isSuccess && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Paid At</span>
                    <span>
                      {new Date(payment.paymentDate).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button onClick={onViewOrders} className="w-full">
                View Order History
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

