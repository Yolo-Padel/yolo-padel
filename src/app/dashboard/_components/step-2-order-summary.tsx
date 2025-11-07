"use client";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { formatTimeSlots } from "@/lib/time-slots-formatter";
import { stringUtils } from "@/lib/format/string";

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

type OrderSummaryProps = {
  cartItems: CartItem[];
  onBack: () => void;
  onNext: (paymentMethod: string) => void;
};

const PAYMENT_METHODS = [
  {
    id: "QRIS",
    name: "QRIS",
    icon: "/payment-icons/qris.svg", // Placeholder
  },
  {
    id: "BNI_VA",
    name: "BNI Virtual Account",
    icon: "/payment-icons/bni.svg", // Placeholder
  },
  {
    id: "BCA_VA",
    name: "BCA Virtual Account",
    icon: "/payment-icons/bca.svg", // Placeholder
  },
];

export function OrderSummary({ cartItems, onBack, onNext }: OrderSummaryProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("QRIS");
  const [showAllMethods, setShowAllMethods] = useState(false);

  // Calculate totals
  const courtFeesTotal = cartItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const tax = "TBC"; // Per requirement
  const bookingFee = "TBC"; // Per requirement
  const grandTotal = courtFeesTotal; // For now, only court fees

  const handleNext = () => {
    if (!selectedPaymentMethod) return;
    onNext(selectedPaymentMethod);
  };

  // Display only first 3 methods initially
  const displayedMethods = showAllMethods
    ? PAYMENT_METHODS
    : PAYMENT_METHODS.slice(0, 3);

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

      <Separator />

      {/* Payment Method Selection */}
      <div className="space-y-3">
        <h3 className="font-semibold">Payment Method</h3>
        <RadioGroup
          value={selectedPaymentMethod}
          onValueChange={setSelectedPaymentMethod}
        >
          <div className="space-y-3">
            {displayedMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-accent"
                onClick={() => setSelectedPaymentMethod(method.id)}
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <Label
                  htmlFor={method.id}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  {/* Payment Icon Placeholder */}
                  <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs font-mono">TBC</span>
                  </div>
                  <span className="font-medium">TBC</span>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>

        {/* View All Methods - Currently disabled as per requirement */}
        {/* {!showAllMethods && PAYMENT_METHODS.length > 3 && (
          <Button
            variant="ghost"
            className="w-full text-primary"
            onClick={() => setShowAllMethods(true)}
          >
            View All Payment Methods
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        )} */}
      </div>

      <Separator />

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
        onClick={handleNext}
        disabled={!selectedPaymentMethod}
      >
        Book Now
      </Button>
    </div>
  );
}
