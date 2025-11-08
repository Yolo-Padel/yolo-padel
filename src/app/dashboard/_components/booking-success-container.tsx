"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { CartItem } from "./order-summary-container";
import { stringUtils } from "@/lib/format/string";

type BookingSuccessContainerProps = {
  orderCode: string;
  cartItems: CartItem[];
  paymentMethod: string;
  totalAmount: number;
  onBookAgain: () => void;
};

export function BookingSuccessContainer({
  orderCode,
  cartItems,
  paymentMethod,
  totalAmount,
  onBookAgain,
}: BookingSuccessContainerProps) {
  const router = useRouter();

  // Format booking summary
  const firstItem = cartItems[0];
  const formattedDate = firstItem
    ? format(firstItem.date, "d MMM yyyy", { locale: idLocale })
    : "";
  const timeRange = firstItem
    ? `${firstItem.slots[0]?.split("–")[0] || ""} - ${
        firstItem.slots[firstItem.slots.length - 1]?.split("–")[1] || ""
      }`.replace(/\./g, ":")
    : "";
  const totalDuration = cartItems.reduce(
    (sum, item) => sum + item.slots.length,
    0
  );

  return (
    <div className="flex flex-col gap-6 items-center text-center py-8">
      {/* Success Icon */}
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-green-200 dark:bg-green-900/40 flex items-center justify-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Booking Confirmed!</h2>
        <p className="text-muted-foreground">
          Your padel court is ready — see you on the court!
        </p>
      </div>

      {/* Booking Details Card */}
      <div className="w-full border border-primary rounded-lg p-6 space-y-3 text-left">
        {cartItems.length === 1 ? (
          // Single booking
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Court Name</span>
              <span className="font-medium">
                {firstItem.venueName} • {firstItem.courtName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">{timeRange}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{totalDuration}hrs</span>
            </div>
          </>
        ) : (
          // Multiple bookings
          <>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Code</span>
              <span className="font-medium font-mono">{orderCode}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Bookings</span>
              <span className="font-medium">
                {cartItems.length} Court{cartItems.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Duration</span>
              <span className="font-medium">{totalDuration}hrs</span>
            </div>
          </>
        )}

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium">
              {paymentMethod === "QRIS"
                ? "QRIS"
                : paymentMethod === "BNI_VA"
                  ? "BNI Virtual Account"
                  : "BCA Virtual Account"}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-muted-foreground">Total Payment</span>
            <span className="font-semibold">
              {stringUtils.formatRupiah(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Email Notice */}
      <p className="text-sm text-muted-foreground">
        An e-receipt has been sent to your email. Please check in at the front
        desk upon arrival.
      </p>

      {/* Action Buttons */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button variant="outline" className="w-full h-11" onClick={onBookAgain}>
          Booking Again
        </Button>
        <Button
          className="w-full h-11"
          onClick={() => router.push("/dashboard/order-history")}
        >
          My Booking
        </Button>
      </div>
    </div>
  );
}
