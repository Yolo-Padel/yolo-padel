"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, XIcon, Calendar, Clock, MapPin } from "lucide-react";
import { stringUtils } from "@/lib/format/string";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export type BookingDetail = {
  id: string;
  bookingCode: string;
  bookingDate: string;
  duration: number;
  totalPrice: number;
  court: {
    name: string;
    venue: {
      name: string;
    };
  };
  timeSlots: Array<{
    openHour: string;
    closeHour: string;
  }>;
};

export type PaymentStatusResponse = {
  id: string;
  status: string;
  amount: number;
  taxAmount: number;    // Fee breakdown field (Requirements 1.3)
  bookingFee: number;   // Fee breakdown field (Requirements 2.3)
  paymentDate: string | null;
  expiredAt: string | null;
  order: {
    id: string;
    orderCode: string;
    status: string;
    bookings: BookingDetail[];
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
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <div className="relative">
          <DialogTitle className="sr-only">
            Payment {isSuccess ? "Successful" : "Failed"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 bg-primary hover:bg-primary/90 rounded-full"
            onClick={onClose}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
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
              <div className="border rounded-lg p-4 space-y-3 bg-muted/50">
                {/* Order Info */}
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
                {payment.paymentDate && isSuccess && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Paid At</span>
                    <span className="text-sm">
                      {new Date(payment.paymentDate).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}

                {/* Booking Details */}
                {/* {payment.order?.bookings && payment.order.bookings.length > 0 && (
                  <div className="border-t pt-3 mt-3 space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Booking Details
                    </span>
                    {payment.order.bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-background rounded-md p-3 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {booking.bookingCode}
                          </span>
                          <span className="text-sm font-medium">
                            {stringUtils.formatRupiah(booking.totalPrice)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          <span>
                            {booking.court.venue.name} • {booking.court.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            <span>
                              {format(new Date(booking.bookingDate), "d MMM yyyy", {
                                locale: idLocale,
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="size-3" />
                            <span>
                              {booking.timeSlots
                                .map((slot) => `${slot.openHour}-${slot.closeHour}`)
                                .join(", ")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )} */}

                {/* Payment Breakdown */}
                <div className="border-t pt-3 mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Court Fees</span>
                    <span>{stringUtils.formatRupiah(payment.amount)}</span>
                  </div>
                  {payment.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{stringUtils.formatRupiah(payment.taxAmount)}</span>
                    </div>
                  )}
                  {payment.bookingFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Booking Fee</span>
                      <span>{stringUtils.formatRupiah(payment.bookingFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-semibold border-t pt-2">
                    <span>Total Payment</span>
                    <span>
                      {stringUtils.formatRupiah(
                        payment.amount + payment.taxAmount + payment.bookingFee
                      )}
                    </span>
                  </div>
                </div>
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
