"use client";

import { useState, useCallback } from "react";
import { CartItem, OrderSummaryContainer } from "./order-summary-container";
import { PaymentInstructionsContainer } from "./payment-instructions-container";
import { BookingSuccessContainer } from "./booking-success-container";
import { CourtSelectionContainer } from "./court-selection-container";
import { useCreateOrder } from "@/hooks/use-order";
import { transformUISlotsToOrderFormat } from "@/lib/booking-slots-utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

type BookingFormMultiStepProps = {
  onClose: () => void;
  isModal?: boolean;
};

type Step = 1 | 2 | 3 | 4;

export function BookingFormMultiStep({
  onClose,
  isModal = false,
}: BookingFormMultiStepProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [orderData, setOrderData] = useState<{
    orderCode: string;
    orderId: string;
    totalAmount: number;
  } | null>(null);
  // Guest info state (from step 1)
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [guestFullName, setGuestFullName] = useState<string>("");

  const { user } = useAuth();
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();

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

  // Handle submit order (step 2 → step 3)
  // This is now handled by OrderSummaryContainer for guest flow
  // For authenticated users, this is still called but order creation happens in OrderSummaryContainer
  const handleSubmitOrder = (paymentMethod: string) => {
    setSelectedPaymentMethod(paymentMethod);
    // Order creation is now handled in OrderSummaryContainer
    // This function is kept for backward compatibility
  };

  // Handle order created (called from OrderSummaryContainer)
  const handleOrderCreated = (order: {
    orderCode: string;
    orderId: string;
    totalAmount: number;
  }) => {
    setOrderData(order);
    setCurrentStep(3);
  };

  // Handle clear cart (for error rollback)
  const handleClearCart = () => {
    setCart([]);
  };

  // Handle payment completion (step 3 → step 4)
  const handlePaymentComplete = () => {
    setCurrentStep(4);
  };

  // Handle book again (reset form)
  const handleBookAgain = () => {
    setCart([]);
    setSelectedPaymentMethod("");
    setOrderData(null);
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
          onNext={handleSubmitOrder}
          guestEmail={guestEmail}
          guestFullName={guestFullName}
          onClearCart={handleClearCart}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {currentStep === 3 && orderData && (
        <PaymentInstructionsContainer
          paymentMethod={selectedPaymentMethod}
          orderCode={orderData.orderCode}
          totalAmount={orderData.totalAmount}
          onComplete={handlePaymentComplete}
        />
      )}

      {currentStep === 4 && orderData && (
        <BookingSuccessContainer
          orderCode={orderData.orderCode}
          cartItems={cart}
          paymentMethod={selectedPaymentMethod}
          totalAmount={orderData.totalAmount}
          onBookAgain={handleBookAgain}
        />
      )}
    </div>
  );
}
