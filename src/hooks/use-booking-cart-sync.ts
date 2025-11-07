import { useEffect, useRef } from "react";
import { Court, Venue } from "@prisma/client";
import { getAvailableSlots } from "@/lib/booking-slots-utils";
import { CartItem } from "@/app/dashboard/_components/step-2-order-summary";

type CourtSelections = Map<
  string,
  {
    courtId: string;
    date: Date;
    slots: string[];
  }
>;

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
  onAddToCart: (item: CartItem) => void,
  onRemoveFromCart: (index: number) => void
) {
  // Use ref to track previous sync state to prevent infinite loops
  const previousSyncRef = useRef<string>("");

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

    // Step 2: Sync to cart (in same effect to avoid race condition)
    if (watchSlots.length > 0) {
      // Create cart item
      const cartItem: CartItem = {
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
        courtImage: selectedCourt.image,
        venueName:
          venuesData.find((v) => v.id === selectedVenueId)?.name || "Unknown",
        date: watchDate,
        slots: watchSlots,
        pricePerSlot: selectedCourt.price,
        totalPrice: watchSlots.length * selectedCourt.price,
      };

      // Remove existing entry for this court/date combo
      const existingIndex = cart.findIndex(
        (item) =>
          item.courtId === watchCourtId &&
          item.date.toDateString() === watchDate.toDateString()
      );

      if (existingIndex >= 0) {
        onRemoveFromCart(existingIndex);
      }
      // Add updated cart item
      setTimeout(() => onAddToCart(cartItem), 0);
    } else {
      // No slots selected, remove from cart if exists
      const existingIndex = cart.findIndex(
        (item) =>
          item.courtId === watchCourtId &&
          item.date.toDateString() === watchDate.toDateString()
      );

      if (existingIndex >= 0) {
        onRemoveFromCart(existingIndex);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watchSlots,
    watchCourtId,
    watchDate,
    selectedCourt,
    selectedVenueId,
    venuesData,
    onAddToCart,
    onRemoveFromCart,
  ]);
}

