import { z } from "zod";

export const getCourtsideBookingsSchema = z.object({
  bookingDate: z.string().min(1, "Date is required"),
  apiKey: z.string().min(1, "API key is required"),
});

export type GetCourtsideBooking = z.infer<typeof getCourtsideBookingsSchema>;

export const createCourtsideBookingSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  date: z.string().min(1, "Date is required"),
  start_hours: z.string().min(1, "Start hours is required"),
  duration: z.number().min(1, "Duration is required"),
  court_id: z.string().uuid("Court ID must be a valid UUID"),
  harga: z.number().min(0, "Harga must be a positive number"),
  diskon: z.number().min(0, "Diskon must be a positive number"),
  notes: z.string().nullable().optional(),
  paid: z.boolean(),
  registered: z.boolean(),
  offline_user: z.string().min(1, "Offline user is required"),
});

export type CreateCourtsideBooking = z.infer<
  typeof createCourtsideBookingSchema
>;

export const cancelCourtsideBookingSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  id: z.string().uuid("ID must be a valid UUID"),
  type: z.string().min(1, "Type is required"),
  cancel_note: z.string().min(1, "Cancel note is required"),
  email: z.string().min(1, "Email is required"),
});

export type CancelCourtsideBooking = z.infer<
  typeof cancelCourtsideBookingSchema
>;
