"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { OrderSummaryContainer } from "./order-summary-container";
import { CourtSelectionContainer } from "./court-selection-container";
import { toast } from "sonner";
import { BookingFormValues } from "@/types/booking";

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

  // All state management moved to RHF
  const form = useForm<BookingFormValues>({
    defaultValues: {
      venueId: "",
      courtId: "",
      date: new Date(),
      slots: [],
      totalPrice: 0,
      bookings: [],
      guestEmail: "",
      guestFullName: "",
      courtSelections: new Map(), // For persistence across court/date switches
    },
  });

  // Navigate to Order Summary
  const handleProceedToSummary = () => {
    const bookings = form.getValues("bookings");
    if (bookings.length === 0) {
      toast.error("Please select at least one court and time slot");
      return;
    }
    setCurrentStep(2);
  };

  // Handle back from step 2 to step 1
  const handleBackToSelection = () => {
    setCurrentStep(1);
  };

  // Handle clear bookings (for error rollback)
  const handleClearBookings = () => {
    form.setValue("bookings", []);
    form.setValue("courtSelections", new Map());
    setCurrentStep(1);
  };

  return (
    <div data-cy="booking-form-multi-step">
      {currentStep === 1 && (
        <CourtSelectionContainer
          form={form}
          onClose={onClose}
          isModal={isModal}
          onProceedToSummary={handleProceedToSummary}
        />
      )}

      {currentStep === 2 && (
        <OrderSummaryContainer
          form={form}
          onBack={handleBackToSelection}
          onClearBookings={handleClearBookings}
          taxPercentage={taxPercentage}
          bookingFeePercentage={bookingFeePercentage}
        />
      )}
    </div>
  );
}
