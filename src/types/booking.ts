export type CourtSelection = {
  courtId: string;
  date: Date;
  slots: string[];
};

export type CourtSelections = Map<string, CourtSelection>;

// Import and re-export BookingItem type from order-summary-container
import type { BookingItem } from "@/app/dashboard/_components/order-summary-container";
export type { BookingItem };

export type BookingFormValues = {
  venueId: string;
  courtId: string;
  date: Date | undefined;
  slots: string[];
  totalPrice: number;
  // All booking-related state moved to RHF
  bookings: BookingItem[]; // Array of booking items
  guestEmail?: string; // For non-authenticated users
  guestFullName?: string; // For non-authenticated users
  courtSelections: CourtSelections; // Map for persistence across court/date switches
};
