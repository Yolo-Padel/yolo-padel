import { useEffect, useRef, useMemo } from "react";
import { Court, Venue } from "@prisma/client";
import { getAvailableSlots } from "@/lib/booking-slots-utils";
import { CartItem } from "@/app/dashboard/_components/order-summary-container";
import { CourtSelections } from "@/types/booking";
import type { DynamicPrice } from "@/components/timetable-types";
import { calculateSlotsPrice } from "@/lib/booking-pricing-utils";

/**
 * Hook untuk sync selections ke cart dan update courtSelections
 * Ini adalah logic paling kompleks yang menangani:
 * 1. Update courtSelections map (source of truth)
 * 2. Validation untuk prevent cross-court contamination
 * 3. Sync ke cart dengan debouncing
 */
export function useBookingCartSync(
  watchSlots: string[],
  watchCourtId: string,
  watchDate: Date | undefined,
  selectedCourt: Court | undefined,
  selectedVenueId: string,
  venuesData: Venue[],
  courtSelections: CourtSelections,
  setCourtSelections: React.Dispatch<React.SetStateAction<CourtSelections>>,
  cart: CartItem[],
  onAddToCart: (item: CartItem | ((prev: CartItem[]) => CartItem[])) => void,
  onRemoveFromCart: (index: number | ((prev: CartItem[]) => CartItem[])) => void,
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

    // CRITICAL: Validate that watchSlots BELONG to THIS court selection
    // This prevents Court B from being added with Court A's slots during transition
    if (watchSlots.length > 0) {
      // FIRST CHECK: Does this court already have a selection?
      const existingSelection = courtSelections.get(selectionKey);

      if (!existingSelection) {
        // No selection for THIS court yet. Check if slots exist on ANOTHER court
        let slotsFromAnotherCourt = false;

        for (const [key, value] of courtSelections.entries()) {
          if (key !== selectionKey) {
            // Check if any of watchSlots exist in this other court's selection
            const hasMatchingSlots = value.slots.some((s) =>
              watchSlots.includes(s)
            );
            if (hasMatchingSlots) {
              slotsFromAnotherCourt = true;
              break;
            }
          }
        }

        if (slotsFromAnotherCourt) {
          // Slots exist on another court → cross-court contamination → BLOCK
          return;
        }
      }

      // FINAL CHECK: Are the slots valid for this court's operating hours?
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

    // Step 1: Update courtSelections map (source of truth)
    if (watchSlots.length > 0) {
      setCourtSelections((prev) => {
        const newMap = new Map(prev);
        newMap.set(selectionKey, {
          courtId: watchCourtId,
          date: watchDate,
          slots: watchSlots,
        });
        return newMap;
      });
    } else {
      setCourtSelections((prev) => {
        const newMap = new Map(prev);
        newMap.delete(selectionKey);
        return newMap;
      });
    }

    // Step 2: Sync to cart (use functional update untuk avoid race condition)
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

      // Create cart item
      const cartItem: CartItem = {
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
        courtImage: selectedCourt.image,
        venueName,
        date: watchDate,
        slots: watchSlots,
        pricePerSlot: averagePricePerSlot,
        totalPrice,
      };

      // Use functional update untuk ensure consistency
      onAddToCart((prevCart) => {
        // Remove existing entry for this court/date combo
        const filteredCart = prevCart.filter(
          (item) =>
            !(
              item.courtId === watchCourtId &&
              item.date.toDateString() === watchDate.toDateString()
            )
        );
        return [...filteredCart, cartItem];
      });
    } else {
      // No slots selected, remove from cart if exists
      onRemoveFromCart((prevCart) =>
        prevCart.filter(
          (item) =>
            !(
              item.courtId === watchCourtId &&
              item.date.toDateString() === watchDate.toDateString()
            )
        )
      );
    }
  }, [
    watchSlots,
    watchCourtId,
    watchDate,
    selectedCourt,
    venueName,
    courtSelections,
    cart,
    setCourtSelections,
    onAddToCart,
    onRemoveFromCart,
    dynamicPrices,
  ]);
}
