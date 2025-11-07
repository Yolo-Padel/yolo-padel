import type { BookingDetail } from "../app/admin/dashboard/booking/_components/booking-detail-modal";

// Types berdasarkan schema Prisma
export type Court = {
  id: string;
  name: string;
  operatingHours?: {
    openHour: string; // Format: "10:00"
    closeHour: string; // Format: "20:00"
  };
};

export type Booking = {
  id: string;
  courtId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  bookingDate: Date;
  timeSlots: Array<{
    openHour: string; // Format: "06:00"
    closeHour: string; // Format: "07:00"
  }>;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
};

export type Venue = {
  id: string;
  name: string;
};

export type TimetableProps = {
  venues?: Venue[];
  selectedVenueId?: string;
  onVenueChange?: (venueId: string) => void;
  courts?: Court[];
  bookings?: Booking[];
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  // Callback untuk transform Booking ke BookingDetail
  // Jika tidak disediakan, akan menggunakan default transform
  transformBookingToDetail?: (
    booking: Booking,
    venueName: string,
    courtName: string
  ) => BookingDetail;
  onMarkAsComplete?: (bookingId: string) => void;
};

export type BookingSlotInfo = {
  booking: Booking;
  isFirstSlot: boolean;
  span: number;
};
