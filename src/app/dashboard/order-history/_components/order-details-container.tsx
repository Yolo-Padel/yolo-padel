"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/hooks/use-order";
import { BookingStatus, PaymentStatus } from "@/types/prisma";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { X } from "lucide-react";
import { stringUtils } from "@/lib/format/string";
import { useReceiptGeneration } from "@/hooks/use-receipt-generation";
import { transformDbFormatToUISlots } from "@/lib/booking-slots-utils";

const getPaymentStatus = (paymentStatus: PaymentStatus) => {
  switch (paymentStatus) {
    case PaymentStatus.PAID:
      return "bg-[#D5FFD5] text-[#1FAD53]";
    case PaymentStatus.UNPAID:
      return "bg-[#FFF5D5] text-[#AD751F]";
    case PaymentStatus.FAILED:
    case PaymentStatus.EXPIRED:
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    default:
      return "bg-gray-500 text-white";
  }
};

const getBookingStatus = (bookingStatus: BookingStatus) => {
  switch (bookingStatus) {
    case BookingStatus.UPCOMING:
      return "bg-[#D5FFD5] text-[#1FAD53]";
    case BookingStatus.PENDING:
      return "bg-[#FFF5D5] text-[#AD751F]";
    case BookingStatus.CANCELLED:
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    case BookingStatus.COMPLETED:
      return "bg-[#D5FFD5] text-[#1FAD53]";
    case BookingStatus.NO_SHOW:
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    default:
      return "bg-gray-500 text-white";
  }
};
export function OrderDetailsContainer({
  onOpenChange,
  orderDetails,
  mode,
  onChangeMode,
  showButtons,
}: {
  onOpenChange: (open: boolean) => void;
  orderDetails: Order | null;
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
  showButtons?: boolean;
}) {
  const { generateReceipt, isGenerating } = useReceiptGeneration();

  const handleDownloadReceipt = () => {
    if (!orderDetails?.id) {
      return;
    }
    generateReceipt(orderDetails.id);
  };

  return (
    <div>
      <div className="grid grid-cols-1">
        {mode === "order-details" && (
          <div className="relative flex flex-row">
            <div className="space-y-2 text-2xl">
              Payment Details
              <p className="font-normal text-sm text-muted-foreground pt-2">
                Your payment has been successfully completed. Here&apos;s your
                booking and transaction summary.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 h-8 w-8 rounded-full bg-primary hover:bg-primary/90"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {mode === "view-booking" && (
          <div className="space-y-2 text-2xl">
            View Booking
            <p className="font-normal text-sm text-muted-foreground pt-2">
              Your payment has been{" "}
              {orderDetails?.payment?.status?.toUpperCase()}. Here's your
              booking and transaction summary.
            </p>
          </div>
        )}
      </div>
      <div className="text-xl gap-1 mt-4 space-y-4">
        <span className="font-medium text-foreground text-base">
          Order Summary
        </span>
        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-foreground">
          <div>Order ID</div>
          <div className="font-medium">{orderDetails?.orderCode}</div>

          <div>Total Bookings</div>
          <div className="font-medium">
            {orderDetails?.bookings?.length || 0} Court
            {orderDetails?.bookings?.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-2">
          <span className="font-medium text-foreground text-base">
            Booking Details
          </span>
          <div className="space-y-2 mt-2">
            {orderDetails?.bookings?.map((booking, index) => {
              // Format date
              const bookingDate = format(
                new Date(booking.bookingDate),
                "d MMM yyyy",
                { locale: idLocale }
              );

              // Format time slots
              const timeSlots = transformDbFormatToUISlots(booking.timeSlots);

              return (
                <div
                  key={booking.id}
                  className="border rounded-lg p-3 space-y-2.5"
                >
                  {/* Header: Info Key - Venue, Court, Date, Time, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="font-semibold text-sm truncate">
                        {booking.court.venue.name} • {booking.court.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {bookingDate} • {timeSlots.join(", ")}
                      </div>
                    </div>
                    <Badge
                      className={`rounded-md px-3 py-1 text-xs font-medium ${getBookingStatus(booking.status as BookingStatus)}`}
                    >
                      {stringUtils.toTitleCase(booking.status)}
                    </Badge>
                  </div>

                  {/* Body: Secondary Info - Booking ID, Duration, Price */}
                  <div className="flex items-center justify-between text-xs pt-1.5 border-t">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="font-mono">{booking.bookingCode}</span>
                      <span>•</span>
                      <span>
                        {booking.duration} hour
                        {booking.duration !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <span className="font-semibold text-sm text-foreground">
                      {stringUtils.formatRupiah(booking.totalPrice)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <span className="font-medium text-foreground text-base">
          Payment Details
        </span>
        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-foreground">
          <div>Total Amount</div>
          <div className="font-medium">
            {stringUtils.formatRupiah(orderDetails?.totalAmount || 0)}
          </div>

          <div>Payment Status</div>
          <div className={`font-medium`}>
            <Badge
              className={getPaymentStatus(
                orderDetails?.payment?.status || PaymentStatus.UNPAID
              )}
            >
              {stringUtils.toTitleCase(orderDetails?.payment?.status || "")}
            </Badge>
          </div>

          <div>Order Created</div>
          <div className="font-medium">
            {orderDetails?.createdAt
              ? format(new Date(orderDetails.createdAt), "d MMM yyyy, HH:mm", {
                  locale: idLocale,
                })
              : "N/A"}
          </div>

          {orderDetails?.payment?.paymentDate && (
            <>
              <div>Payment Date</div>
              <div className="font-medium">
                {format(
                  new Date(orderDetails.payment.paymentDate),
                  "d MMM yyyy, HH:mm",
                  { locale: idLocale }
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {showButtons === true && (
        <div className="mt-4">
          {/*Payment Paid Button*/}
          {orderDetails?.payment?.status === PaymentStatus.PAID && (
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
                onClick={handleDownloadReceipt}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating receipt..." : "Download Receipt"}
              </Button>
            </div>
          )}

          {/*Pending Payment Button*/}
          {orderDetails?.payment?.status === PaymentStatus.UNPAID && (
            <div className="w-full gap-2">
              <Button
                className="w-full rounded-sm"
                variant="default"
                onClick={() => {
                  window.open(orderDetails?.payment?.paymentUrl, "_blank");
                }}
              >
                Pay Now
              </Button>
            </div>
          )}

          {/*Payment Failed/Expired Button*/}
          {(orderDetails?.payment?.status === PaymentStatus.FAILED ||
            orderDetails?.payment?.status === PaymentStatus.EXPIRED) && (
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
                onClick={() => ""}
              >
                Book Again
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
