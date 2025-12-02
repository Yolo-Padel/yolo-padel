import { useEffect, useRef, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { Court, Venue } from "@prisma/client";
import { getAvailableSlots } from "@/lib/booking-slots-utils";
import { BookingItem } from "@/app/dashboard/_components/order-summary-container";
import { BookingFormValues, CourtSelections } from "@/types/booking";
import type { DynamicPrice } from "@/components/timetable-types";
import { calculateSlotsPrice } from "@/lib/booking-pricing-utils";

/**
 * Hook untuk set default venue dan court saat pertama kali load
 */
export function useBookingDefaults(
  form: UseFormReturn<BookingFormValues>,
  venuesData: Venue[],
  courtsData: Court[],
  watchVenueId: string,
  watchCourtId: string
) {
  // Set default venue on mount
  useEffect(() => {
    if (venuesData.length > 0 && !watchVenueId) {
      const firstId = venuesData[0].id;
      form.setValue("venueId", firstId);
    }
  }, [venuesData, watchVenueId, form]);

  // Set default court when courts are loaded
  useEffect(() => {
    if (courtsData.length > 0 && !watchCourtId) {
      form.setValue("courtId", courtsData[0].id);
    }
  }, [courtsData, watchCourtId, form]);
}

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

/**
 * Hook untuk enforce business rule: 1 order = 1 date
 * When user changes date, reset all bookings and selections from previous date
 */
export function useBookingDateConstraint(
  form: UseFormReturn<BookingFormValues>,
  watchDate: Date | undefined,
  watchCourtId: string
) {
  useEffect(() => {
    if (!watchDate) return;

    const currentDateKey = watchDate.toDateString();
    const currentBookings = form.getValues("bookings");
    const currentCourtSelections = form.getValues("courtSelections");

    // Filter bookings to only keep items from current date
    const bookingsForCurrentDate = currentBookings.filter(
      (item) => item.date.toDateString() === currentDateKey
    );

    // Filter courtSelections to only keep selections from current date
    const selectionsForCurrentDate = new Map<string, any>();
    for (const [key, value] of currentCourtSelections.entries()) {
      if (value.date.toDateString() === currentDateKey) {
        selectionsForCurrentDate.set(key, value);
      }
    }

    // If there are bookings or selections from other dates, clear them
    if (
      bookingsForCurrentDate.length !== currentBookings.length ||
      selectionsForCurrentDate.size !== currentCourtSelections.size
    ) {
      // Update bookings to only include current date
      form.setValue("bookings", bookingsForCurrentDate);

      // Update courtSelections to only include current date
      form.setValue("courtSelections", selectionsForCurrentDate);

      // Reset slots if they don't belong to current date
      const currentSlots = form.getValues("slots");
      if (currentSlots.length > 0 && watchCourtId) {
        // Check if current slots belong to current date and court
        const hasSelectionForCurrentDateAndCourt = Array.from(
          selectionsForCurrentDate.values()
        ).some(
          (selection) =>
            selection.courtId === watchCourtId &&
            selection.date.toDateString() === currentDateKey
        );

        // If no selection for current date and court, reset slots
        if (!hasSelectionForCurrentDateAndCourt) {
          form.setValue("slots", []);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchDate]); // Only watch date changes
}

/**
 * Hook untuk load previous selections saat switching courts atau dates
 * Ini memungkinkan user untuk kembali ke court/date yang sama dan menemukan selections mereka
 */
export function useCourtSlotsPersistence(
  form: UseFormReturn<BookingFormValues>,
  watchCourtId: string,
  watchDate: Date | undefined,
  courtSelections: CourtSelections
) {
  // Use ref to track previous load state to prevent infinite loops
  const previousLoadRef = useRef<string>("");

  useEffect(() => {
    if (!watchCourtId || !watchDate) return;

    // Use normalized date for consistent comparison
    const dateKey = watchDate.toDateString(); // More stable than toISOString
    const selectionKey = `${watchCourtId}-${dateKey}`;

    // Prevent infinite loop - only load if court/date actually changed
    if (previousLoadRef.current === selectionKey) {
      return;
    }
    previousLoadRef.current = selectionKey;

    // Find previous selection with same court and date
    let previousSelection:
      | { courtId: string; date: Date; slots: string[] }
      | undefined;
    for (const [key, value] of courtSelections.entries()) {
      if (
        value.courtId === watchCourtId &&
        value.date.toDateString() === dateKey
      ) {
        previousSelection = value;
        break;
      }
    }

    if (previousSelection) {
      // Load previous slots for this court
      form.setValue("slots", previousSelection.slots);
    } else {
      // No previous selection, reset slots
      form.setValue("slots", []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchCourtId, watchDate]); // Don't include courtSelections or form
}

/**
 * Hook untuk manage booking selections dan update bookings array
 * Ini adalah logic paling kompleks yang menangani:
 * 1. Update courtSelections map untuk persistence
 * 2. Validation untuk prevent cross-court contamination
 * 3. Transform slots selection menjadi bookings array dengan pricing
 */
export function useBookingSelections(
  form: UseFormReturn<BookingFormValues>,
  watchSlots: string[],
  watchCourtId: string,
  watchDate: Date | undefined,
  selectedCourt: Court | undefined,
  selectedVenueId: string,
  venuesData: Venue[],
  dynamicPrices: DynamicPrice[] = []
) {
  // Use ref to track previous sync state to prevent infinite loops
  const previousSyncRef = useRef<string>("");

  // Memoize venue lookup untuk avoid re-computation
  const venueName = useMemo(() => {
    return venuesData.find((v) => v.id === selectedVenueId)?.name || "Unknown";
  }, [venuesData, selectedVenueId]);

  useEffect(() => {
    if (!watchCourtId || !watchDate || !selectedCourt) return;

    const dateKey = watchDate.toDateString();
    const selectionKey = `${watchCourtId}-${dateKey}`;
    const slotsKey = watchSlots.join(",");
    const syncKey = `${selectionKey}:${slotsKey}`;

    // Prevent infinite loop: only process if state actually changed
    if (previousSyncRef.current === syncKey) {
      return;
    }

    // Get current courtSelections from form (not from watch to avoid infinite loops)
    const currentCourtSelections = form.getValues("courtSelections");

    if (watchSlots.length > 0) {
      // Validate that slots are valid for this court's operating hours
      // This check is sufficient to prevent cross-court contamination:
      // - If slots are valid for this court, user intentionally selected them for this court
      // - If slots are invalid, they will be blocked (preventing contamination)
      // - Multiple courts can have the same slots (business rule allows this)
      const currentAvailableSlots = getAvailableSlots(selectedCourt, watchDate);
      const allSlotsValid = watchSlots.every((slot) =>
        currentAvailableSlots.includes(slot)
      );

      if (!allSlotsValid) {
        // Slots not valid for this court's operating hours → BLOCK
        return;
      }
    }

    previousSyncRef.current = syncKey;

    // Step 1: Update courtSelections map (source of truth) in RHF
    // Reuse currentCourtSelections from validation above
    const newCourtSelections = new Map(currentCourtSelections);

    if (watchSlots.length > 0) {
      newCourtSelections.set(selectionKey, {
        courtId: watchCourtId,
        date: watchDate,
        slots: watchSlots,
      });
    } else {
      newCourtSelections.delete(selectionKey);
    }
    form.setValue("courtSelections", newCourtSelections);

    // Step 2: Transform slots selection menjadi bookings array in RHF
    const currentBookings = form.getValues("bookings");

    if (watchSlots.length > 0) {
      // Calculate prices using dynamic pricing if available
      const { pricesPerSlot, totalPrice } = calculateSlotsPrice(
        watchSlots,
        watchDate,
        selectedCourt.price,
        dynamicPrices
      );

      // Use average price per slot for display (backward compatibility)
      const averagePricePerSlot =
        pricesPerSlot.length > 0
          ? Math.round(totalPrice / pricesPerSlot.length)
          : selectedCourt.price;

      // Create booking item
      const bookingItem: BookingItem = {
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
        courtImage: selectedCourt.image,
        venueName,
        date: watchDate,
        slots: watchSlots,
        pricePerSlot: averagePricePerSlot,
        totalPrice,
      };

      // Remove existing entry for this court/date combo, then add new one
      const filteredBookings = currentBookings.filter(
        (item) =>
          !(
            item.courtId === watchCourtId &&
            item.date.toDateString() === watchDate.toDateString()
          )
      );
      form.setValue("bookings", [...filteredBookings, bookingItem]);
    } else {
      // No slots selected, remove from bookings if exists
      const filteredBookings = currentBookings.filter(
        (item) =>
          !(
            item.courtId === watchCourtId &&
            item.date.toDateString() === watchDate.toDateString()
          )
      );
      form.setValue("bookings", filteredBookings);
    }
  }, [
    form,
    watchSlots,
    watchCourtId,
    watchDate,
    selectedCourt,
    venueName,
    dynamicPrices,
  ]);
}
