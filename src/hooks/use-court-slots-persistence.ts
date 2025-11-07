import { useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";

type BookingFormValues = {
  venueId: string;
  courtId: string;
  date: Date | undefined;
  slots: string[];
  totalPrice: number;
};

type CourtSelections = Map<
  string,
  {
    courtId: string;
    date: Date;
    slots: string[];
  }
>;

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

