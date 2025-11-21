"use client";

import { useState, useCallback } from "react";
import { CartItem, OrderSummaryContainer } from "./order-summary-container";
import { CourtSelectionContainer } from "./court-selection-container";
import { toast } from "sonner";

type BookingFormMultiStepProps = {
  taxPercentage: number;
  bookingFeePercentage: number;
  onClose: () => void;
  isModal?: boolean;
};

type Step = 1 | 2;

export function BookingFormMultiStep({
  taxPercentage,
  bookingFeePercentage,
  onClose,
  isModal = false,
}: BookingFormMultiStepProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  // Guest info state (from step 1)
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [guestFullName, setGuestFullName] = useState<string>("");

  // Handle adding items to cart (memoized to prevent infinite loops)
  // Support both direct item and functional update
  const handleAddToCart = useCallback(
    (item: CartItem | ((prev: CartItem[]) => CartItem[])) => {
      if (typeof item === "function") {
        setCart(item);
      } else {
        setCart((prev) => [...prev, item]);
      }
    },
    []
  );

  // Handle removing item from cart (memoized to prevent infinite loops)
  // Support both index-based and functional update
  const handleRemoveFromCart = useCallback(
    (indexOrUpdater: number | ((prev: CartItem[]) => CartItem[])) => {
      if (typeof indexOrUpdater === "function") {
        setCart(indexOrUpdater);
      } else {
        setCart((prev) => prev.filter((_, i) => i !== indexOrUpdater));
      }
    },
    []
  );

  // Navigate to Order Summary
  const handleProceedToSummary = () => {
    if (cart.length === 0) {
      toast.error("Please select at least one court and time slot");
      return;
    }
    setCurrentStep(2);
  };

  // Handle back from step 2 to step 1
  const handleBackToSelection = () => {
    setCurrentStep(1);
  };

  // Handle clear cart (for error rollback)
  const handleClearCart = () => {
    setCart([]);
    setCurrentStep(1);
  };

  return (
    <div>
      {currentStep === 1 && (
        <CourtSelectionContainer
          onClose={onClose}
          isModal={isModal}
          cart={cart}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onProceedToSummary={handleProceedToSummary}
          onGuestInfoChange={(email, fullName) => {
            setGuestEmail(email);
            setGuestFullName(fullName);
          }}
        />
      )}

      {currentStep === 2 && (
        <OrderSummaryContainer
          cartItems={cart}
          onBack={handleBackToSelection}
          guestEmail={guestEmail}
          guestFullName={guestFullName}
          onClearCart={handleClearCart}
          taxPercentage={taxPercentage}
          bookingFeePercentage={bookingFeePercentage}
        />
      )}
    </div>
  );
}
