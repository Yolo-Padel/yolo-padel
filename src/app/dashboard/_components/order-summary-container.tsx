"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import Image from "next/image";
import { formatTimeSlots } from "@/lib/time-slots-formatter";
import { stringUtils } from "@/lib/format/string";
import { useAuth, useCreateGuestUser } from "@/hooks/use-auth";
import { useCreateOrder } from "@/hooks/use-order";
import { transformUISlotsToOrderFormat } from "@/lib/booking-slots-utils";
import { toast } from "sonner";
import { BookingFormValues } from "@/types/booking";

const DEFAULT_PAYMENT_CHANNEL = "XENDIT_INVOICE";

export type BookingItem = {
  courtId: string;
  courtName: string;
  courtImage: string | null;
  venueName: string;
  date: Date;
  slots: string[]; // UI format: ["06.00–07.00"]
  pricePerSlot: number;
  totalPrice: number;
};

type OrderSummaryContainerProps = {
  form: UseFormReturn<BookingFormValues>;
  taxPercentage: number;
  bookingFeePercentage: number;
  onBack: () => void;
  onClearBookings?: () => void;
};

export function OrderSummaryContainer({
  form,
  taxPercentage,
  bookingFeePercentage,
  onBack,
  onClearBookings,
}: OrderSummaryContainerProps) {
  // Get all values from RHF form
  const bookingItems = form.watch("bookings");
  const guestEmail = form.watch("guestEmail") || "";
  const guestFullName = form.watch("guestFullName") || "";
  const [isProcessing, setIsProcessing] = useState(false);

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { mutate: createGuestUser } = useCreateGuestUser();
  const { mutate: createOrder } = useCreateOrder();

  // Calculate totals
  const courtFeesTotal = bookingItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );
  const taxAmount = taxPercentage * courtFeesTotal; // Per requirement
  const bookingFeeAmount = bookingFeePercentage * courtFeesTotal; // Per requirement
  const grandTotal = courtFeesTotal + taxAmount + bookingFeeAmount; // For now, only court fees

  const handleSubmit = () => {
    setIsProcessing(true);
    console.log("isProcessing", isProcessing);
    // If guest, create user first, then create order
    if (!isAuthenticated) {
      // Validate guest info
      if (!guestEmail || !guestFullName) {
        toast.error("Email and full name are required");
        return;
      }

      // Step 1: Create guest user
      createGuestUser(
        {
          email: guestEmail,
          fullName: guestFullName,
        },
        {
          onSuccess: async () => {
            // Step 2: Wait for auth state to update, then create order
            // The useCreateGuestUser hook already refetches currentUser
            // Wait a bit for the refetch to complete, then proceed
            await new Promise((resolve) => setTimeout(resolve, 1000));
            createOrderInternal();
          },
          onError: (error: Error) => {
            setIsProcessing(false);
            toast.error(error.message || "Failed to create account");
            // Rollback: clear bookings on error
            if (onClearBookings) {
              onClearBookings();
            }
          },
        },
      );
    } else {
      // Authenticated user: directly create order
      createOrderInternal();
    }
  };

  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const createOrderInternal = async () => {
    // Transform booking items to order format
    const bookings = bookingItems.map((item) => ({
      courtId: item.courtId,
      date: formatDateToString(item.date), // Format as YYYY-MM-DD string
      slots: transformUISlotsToOrderFormat(item.slots),
      price: item.pricePerSlot,
    }));

    // Create order with fee breakdown (Requirements 4.1, 4.2, 4.3)
    // Use Math.round() to ensure integer values for database storage
    createOrder(
      {
        bookings,
        channelName: DEFAULT_PAYMENT_CHANNEL,
        taxAmount: Math.round(taxAmount),
        bookingFee: Math.round(bookingFeeAmount),
      },
      {
        onSuccess: async (order) => {
          try {
            // After order created, create Xendit payment
            const paymentEndpoint = `/api/order/${order.id}/xendit/invoice`;

            const requestBody = {
              externalId: order.payment?.id || order.id,
              amount: courtFeesTotal,
              description: `Order ${order.orderCode}`,
              payerEmail: guestEmail || undefined,
            };

            const xenditResponse = await fetch(paymentEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify(requestBody),
            });

            if (!xenditResponse.ok) {
              const errorData = await xenditResponse.json();
              throw new Error(
                errorData.message || "Failed to create Xendit payment",
              );
            }

            const xenditData = await xenditResponse.json();
            const invoiceUrl =
              xenditData?.data?.xenditInvoice?.invoiceUrl || null;

            if (invoiceUrl) {
              window.location.href = invoiceUrl;
            } else {
              toast.info("Invoice URL not available.");
            }

            if (onClearBookings) {
              onClearBookings();
            }
          } catch (error) {
            console.error("Xendit payment creation error:", error);
            setIsProcessing(false);
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to create Xendit payment",
            );
            // Rollback: clear bookings on error
            if (onClearBookings) {
              onClearBookings();
            }
          }
        },
        onError: (error) => {
          setIsProcessing(false);
          toast.error(error.message || "Failed to create order");
          // Rollback: clear bookings on error
          if (onClearBookings) {
            onClearBookings();
          }
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90"
          onClick={onBack}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-semibold">Order Summary</h2>
      </div>

      {/* Booking Items */}
      <div className="space-y-3">
        {bookingItems.map((item, index) => {
          const formattedDate = format(item.date, "d MMM yyyy", {
            locale: idLocale,
          });
          // Enhanced: Handle both continuous and non-continuous time slots
          const timeRange = formatTimeSlots(item.slots);
          const duration = item.slots.length;

          return (
            <div
              key={`${item.courtId}-${index}`}
              className="border border-primary rounded-lg p-4 space-y-2"
            >
              <div className="flex gap-3">
                {/* Court Image */}
                <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={item.courtImage || "/paddle-court1.svg"}
                    alt={item.courtName}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Court Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-sm">
                        {item.venueName} • {item.courtName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formattedDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {formattedDate}
                      </div>
                      <div className="text-xs font-medium mt-1">
                        {duration}hrs
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-2">
                    <div className="text-xs text-muted-foreground">
                      {timeRange}
                    </div>
                    <div className="font-semibold text-sm">
                      {stringUtils.formatRupiah(item.totalPrice)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transaction Summary */}
      <div className="space-y-3">
        <h3 className="font-semibold">Transaction Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Court Fee</span>
            <span className="font-medium">
              {stringUtils.formatRupiah(courtFeesTotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Tax ({taxPercentage * 100}%)
            </span>
            <span className="font-medium">
              {stringUtils.formatRupiah(taxAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Booking Fee ({bookingFeePercentage * 100}%)
            </span>
            <span className="font-medium">
              {stringUtils.formatRupiah(bookingFeeAmount)}
            </span>
          </div>
        </div>
        <Separator />

        <div className="flex justify-between text-lg">
          <span className="font-semibold">Total Transaction</span>
          <span className="font-bold">
            {stringUtils.formatRupiah(grandTotal)}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        className="w-full h-11"
        onClick={handleSubmit}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            Processing... <Loader2 className="h-4 w-4 animate-spin" />
          </>
        ) : (
          "Book Now"
        )}
      </Button>
    </div>
  );
}
