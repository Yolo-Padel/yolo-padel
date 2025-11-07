import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Court, Venue } from "@prisma/client";

type BookingFormValues = {
  venueId: string;
  courtId: string;
  date: Date | undefined;
  slots: string[];
  totalPrice: number;
};

/**
 * Hook untuk set default venue dan court saat pertama kali load
 */
export function useBookingDefaults(
  form: UseFormReturn<BookingFormValues>,
  venuesData: Venue[],
  courtsData: Court[],
  selectedVenueId: string,
  setSelectedVenueId: (id: string) => void,
  watchCourtId: string
) {
  // Set default venue on mount
  useEffect(() => {
    if (venuesData.length > 0 && !selectedVenueId) {
      const firstId = venuesData[0].id;
      setSelectedVenueId(firstId);
      form.setValue("venueId", firstId);
    }
  }, [venuesData, selectedVenueId, setSelectedVenueId, form]);

  // Set default court when courts are loaded
  useEffect(() => {
    if (courtsData.length > 0 && !watchCourtId) {
      form.setValue("courtId", courtsData[0].id);
    }
  }, [courtsData, watchCourtId, form]);
}

