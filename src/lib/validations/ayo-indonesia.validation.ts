import z from "zod";

export const createAyoBookingSchema = z.object({
  date: z.string().min(1, { message: "Date is required" }),
  field_id: z.int().min(1, { message: "Field ID is required" }),
  start_time: z.string().min(1, { message: "Start time is required" }),
  end_time: z.string().min(1, { message: "End time is required" }),
  total_price: z.int().min(1, { message: "Total price is required" }),
});

export type CreateAyoBookingSchema = z.infer<typeof createAyoBookingSchema>;
