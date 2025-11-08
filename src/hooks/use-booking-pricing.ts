import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Court } from "@prisma/client";
import { BookingFormValues } from "@/types/booking";

/**
 * Hook untuk calculate total price based on selected slots
 */
export function useBookingPricing(
  form: UseFormReturn<BookingFormValues>,
  selectedCourt: Court | undefined,
  watchSlots: string[]
) {
  useEffect(() => {
    if (selectedCourt && watchSlots.length > 0) {
      const totalPrice = watchSlots.length * selectedCourt.price;
      form.setValue("totalPrice", totalPrice);
    } else {
      form.setValue("totalPrice", 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchSlots, selectedCourt]); // Don't include form - it's stable
}

