import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Court } from "@prisma/client";
import { BookingFormValues } from "@/types/booking";
import type { DynamicPrice } from "@/components/timetable-types";
import { calculateSlotsPrice } from "@/lib/booking-pricing-utils";

/**
 * Hook untuk calculate total price based on selected slots
 * Supports dynamic pricing if dynamicPrices are provided
 */
export function useBookingPricing(
  form: UseFormReturn<BookingFormValues>,
  selectedCourt: Court | undefined,
  watchSlots: string[],
  watchDate: Date | undefined,
  dynamicPrices: DynamicPrice[] = []
) {
  useEffect(() => {
    if (selectedCourt && watchSlots.length > 0 && watchDate) {
      const { totalPrice } = calculateSlotsPrice(
        watchSlots,
        watchDate,
        selectedCourt.price,
        dynamicPrices
      );
      form.setValue("totalPrice", totalPrice);
    } else {
      form.setValue("totalPrice", 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchSlots, selectedCourt, watchDate, dynamicPrices]); // Don't include form - it's stable
}
