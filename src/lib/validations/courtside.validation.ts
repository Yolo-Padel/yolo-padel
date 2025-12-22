import { z } from "zod";

export const getCourtsideBookingsSchema = z.object({
  bookingDate: z.string().min(1, "Date is required"),
  apiKey: z.string().min(1, "API key is required"),
});

export type GetCourtsideBooking = z.infer<typeof getCourtsideBookingsSchema>;
