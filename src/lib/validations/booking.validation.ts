import { z } from "zod";

export const bookingCreateSchema = z.object({
  courtId: z.string().min(1, "Court ID is required"),
  userId: z.string().min(1, "User ID is required"),
  source: z.string().min(1, "Source is required"),
  bookingDate: z.string().min(1, "Booking date is required"),
  bookingHour: z.string().min(1, "Booking hour is required"),
  duration: z.number().min(1, "Duration is required"),
  totalPrice: z.number().min(1, "Total price is required"),
  status: z.string().min(1, "Status is required"),
});

export const bookingUpdateSchema = z.object({
  id: z.string().min(1, "Booking ID is required"),
  courtId: z.string().min(1, "Court ID is required"),
  userId: z.string().min(1, "User ID is required"),
  source: z.string().min(1, "Source is required"),
  bookingDate: z.string().min(1, "Booking date is required"),
  bookingHour: z.string().min(1, "Booking hour is required"),
  duration: z.number().min(1, "Duration is required"),
  totalPrice: z.number().min(1, "Total price is required"),
  status: z.string().min(1, "Status is required"),
});

export type BookingCreateData = z.infer<typeof bookingCreateSchema>;
export type BookingUpdateData = z.infer<typeof bookingUpdateSchema>;