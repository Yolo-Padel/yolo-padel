import { BookingStatus } from "@/types/prisma";

export type BookingTimeRange = {
  openHour: string;
  closeHour: string;
};

export type NextBookingInfo = {
  bookingId: string;
  bookingCode: string;
  bookingDate: string;
  status: BookingStatus;
  courtId: string;
  courtName: string;
  venueId: string;
  venueName: string;
  timeSlots: BookingTimeRange[];
};
