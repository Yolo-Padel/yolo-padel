import type { ReactNode } from "react";
import type { BookingStatus, DayOfWeek } from "@/types/prisma";
import type { BookingDetail } from "../app/admin/dashboard/timetable/_components/booking-detail-modal";

// Types berdasarkan schema Prisma
export type Court = {
  id: string;
  name: string;
  operatingHours?: {
    openHour: string; // Format: "10:00"
    closeHour: string; // Format: "20:00"
    // Full operating hours data untuk check availability per time slot
    fullOperatingHours?: {
      closed: boolean;
      slots: Array<{
        openHour: string; // Format: "10:00"
        closeHour: string; // Format: "20:00"
      }>;
    };
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
  status: BookingStatus;
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
  // Loading states
  isLoadingTable?: boolean; // When only table is loading (date change)
};

export type BookingSlotInfo = {
  booking: Booking;
  isFirstSlot: boolean;
  span: number;
};

export type DynamicPrice = {
  id: string;
  courtId: string;
  dayOfWeek: DayOfWeek | null;
  date: Date | null;
  startHour: string;
  endHour: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DynamicPriceSlotInfo = {
  dynamicPrice: DynamicPrice;
  isFirstSlot: boolean;
  span: number;
};

export type TimetableRenderCellParams = {
  court: Court;
  timeSlot: string;
  timeIndex: number;
  timeSlots: string[];
  selectedDate: Date;
};

export type TimetableRenderCell = (
  params: TimetableRenderCellParams
) => ReactNode;
