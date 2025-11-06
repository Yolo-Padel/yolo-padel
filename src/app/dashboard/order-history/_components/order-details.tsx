"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/hooks/use-order";
import { BookingStatus, PaymentStatus } from "@/types/prisma";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { X } from "lucide-react";

const getPaymentStatus = (paymentStatus: PaymentStatus) => {
  switch (paymentStatus) {
    case PaymentStatus.PAID:
      return "bg-[#D5FFD5] text-[#1FAD53]";
    case PaymentStatus.PENDING:
      return "bg-[#FFF5D5] text-[#AD751F]";
    case PaymentStatus.FAILED:
    case PaymentStatus.EXPIRED:
      return "bg-[#FFD5D5] text-[#AD1F1F]";
    case PaymentStatus.REFUNDED:
      return "bg-gray-200 text-gray-700";
    default:
      return "bg-gray-500 text-white";
  }
};

const getBookingStatus = (bookingStatus: BookingStatus) => {
  switch (bookingStatus) {
    case BookingStatus.CONFIRMED:
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
export function SeeOrderDetails({
  onOpenChange,
  orderDetails,
  mode,
  onChangeMode,
}: {
  onOpenChange: (open: boolean) => void;
  orderDetails: Order | null;
  mode:
    | "details-payment"
    | "paynow"
    | "payment-success"
    | "view-booking"
    | "change-method"
    | "confirm-method";
  onChangeMode: (
    mode:
      | "details-payment"
      | "paynow"
      | "payment-success"
      | "view-booking"
      | "change-method"
      | "confirm-method"
  ) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-1">
        {mode === "details-payment" && (
          <div className="relative flex flex-row">
            <div className="space-y-2 text-2xl">
              Payment Details
              <p className="font-normal text-sm text-muted-foreground pt-2">
                Your payment has been successfully completed. Here&apos;s your
                booking and transaction summary.
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
              const timeSlots = booking.timeSlots
                .map((slot) => `${slot.openHour}-${slot.closeHour}`)
                .join(", ");

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
                        {bookingDate} • {timeSlots}
                      </div>
                    </div>
                    <Badge
                      className={getBookingStatus(
                        booking.status as BookingStatus
                      )}
                    >
                      {booking.status}
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
                      Rp {booking.totalPrice.toLocaleString("id-ID")}
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
            Rp {orderDetails?.totalAmount?.toLocaleString("id-ID")}
          </div>

          <div>Payment Method</div>
          <div className="font-medium">
            {orderDetails?.payment?.channelName || "N/A"}
          </div>

          <div>Payment Status</div>
          <div className={`font-medium`}>
            <Badge
              className={getPaymentStatus(
                orderDetails?.payment?.status || PaymentStatus.PENDING
              )}
            >
              {orderDetails?.payment?.status}
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
              onClick={() =>
                window.open(`/api/order/${orderDetails?.id}/receipt`)
              }
            >
              Download Receipt
            </Button>
          </div>
        )}

        {/*Pending Payment Button*/}
        {orderDetails?.payment?.status === PaymentStatus.PENDING && (
          <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-2">
            <Button
              className="w-full border-primary rounded-sm"
              variant="outline"
              onClick={() => onChangeMode("change-method")}
            >
              Change Payment Method
            </Button>

            <Button
              className="w-full rounded-sm"
              variant="default"
              onClick={() => {
                onChangeMode("paynow");
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

        {/*Payment Refunded Button*/}
        {orderDetails?.payment?.status === PaymentStatus.REFUNDED && (
          <Button
            className="w-full border-primary rounded-sm"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
