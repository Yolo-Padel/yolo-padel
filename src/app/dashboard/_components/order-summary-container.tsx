"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { formatTimeSlots } from "@/lib/time-slots-formatter";
import { stringUtils } from "@/lib/format/string";
import { useAuth, useCreateGuestUser } from "@/hooks/use-auth";
import { useCreateOrder } from "@/hooks/use-order";
import { transformUISlotsToOrderFormat } from "@/lib/booking-slots-utils";
import { toast } from "sonner";

const DEFAULT_PAYMENT_CHANNEL = "XENDIT_INVOICE";

export type CartItem = {
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
  cartItems: CartItem[];
  onBack: () => void;
  guestEmail?: string;
  guestFullName?: string;
  onClearCart?: () => void;
};

export function OrderSummaryContainer({
  cartItems,
  onBack,
  guestEmail = "",
  guestFullName = "",
  onClearCart,
}: OrderSummaryContainerProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { mutate: createGuestUser } = useCreateGuestUser();
  const { mutate: createOrder } = useCreateOrder();

  // Calculate totals
  const courtFeesTotal = cartItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const tax = "TBC"; // Per requirement
  const bookingFee = "TBC"; // Per requirement
  const grandTotal = courtFeesTotal; // For now, only court fees

  const handleSubmit = () => {
    // If guest, create user first, then create order
    if (!isAuthenticated) {
      // Validate guest info
      if (!guestEmail || !guestFullName) {
        toast.error("Email dan nama lengkap wajib diisi");
        return;
      }

      setIsProcessing(true);

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
            toast.error(error.message || "Gagal membuat akun guest");
            // Rollback: clear cart on error
            if (onClearCart) {
              onClearCart();
            }
          },
        }
      );
    } else {
      // Authenticated user: directly create order
      createOrderInternal();
    }
  };

  const createOrderInternal = async () => {
    // Transform cart items to order format
    const bookings = cartItems.map((item) => ({
      courtId: item.courtId,
      date: item.date,
      slots: transformUISlotsToOrderFormat(item.slots),
      price: item.pricePerSlot,
    }));

    // Create order
    createOrder(
      {
        bookings,
        channelName: DEFAULT_PAYMENT_CHANNEL,
      },
      {
        onSuccess: async (order) => {
          try {
            // After order created, create Xendit payment
            const paymentEndpoint = `/api/order/${order.id}/xendit/invoice`;

            const requestBody = {
              externalId: order.payment?.id || order.id,
              amount: order.totalAmount,
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
                errorData.message || "Gagal membuat payment Xendit"
              );
            }

            const xenditData = await xenditResponse.json();
            const invoiceUrl =
              xenditData?.data?.xenditInvoice?.invoiceUrl || null;

            setIsProcessing(false);
            if (onClearCart) {
              onClearCart();
            }

            if (invoiceUrl) {
              window.location.href = invoiceUrl;
            } else {
              toast.info("Invoice URL tidak tersedia.");
            }
          } catch (error) {
            console.error("Xendit payment creation error:", error);
            setIsProcessing(false);
            toast.error(
              error instanceof Error
                ? error.message
                : "Gagal membuat payment Xendit"
            );
            // Rollback: clear cart on error
            if (onClearCart) {
              onClearCart();
            }
          }
        },
        onError: (error) => {
          setIsProcessing(false);
          toast.error(error.message || "Gagal membuat order");
          // Rollback: clear cart on error
          if (onClearCart) {
            onClearCart();
          }
        },
      }
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

      {/* Cart Items */}
      <div className="space-y-3">
        {cartItems.map((item, index) => {
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
            <span className="text-muted-foreground">Tax (10%)</span>
            <span className="font-medium">{tax}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking Fee</span>
            <span className="font-medium">{bookingFee}</span>
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
        {isProcessing ? "Processing..." : "Book Now"}
      </Button>
    </div>
  );
}
