import { z } from "zod";

// Time slot schema for booking
const bookingTimeSlotSchema = z.object({
  openHour: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Invalid time format (expected HH:MM)"
    ),
  closeHour: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      "Invalid time format (expected HH:MM)"
    ),
});

export const bookingCreateSchema = z
  .object({
    courtId: z.string().min(1, "Court ID is required"),
    userId: z.string().min(1, "User ID is required"),
    orderId: z.string().optional(), // Optional - for order flow
    source: z.string().min(1, "Source is required"),
    bookingDate: z.string().min(1, "Booking date is required"),
    bookingHour: z.string().optional(), // Deprecated, optional for backward compatibility
    timeSlots: z
      .array(bookingTimeSlotSchema)
      .min(1, "At least one time slot is required"),
    duration: z.number().min(1, "Duration is required"),
    totalPrice: z.number().min(1, "Total price is required"),
    status: z.string().min(1, "Status is required"),
  })
  .refine(
    (data) => {
      // Duration should match timeSlots length
      return data.duration === data.timeSlots.length;
    },
    {
      message: "Duration must match the number of time slots",
      path: ["duration"],
    }
  );

export const bookingUpdateSchema = z
  .object({
    id: z.string().min(1, "Booking ID is required"),
    courtId: z.string().min(1, "Court ID is required"),
    userId: z.string().min(1, "User ID is required"),
    source: z.string().min(1, "Source is required"),
    bookingDate: z.string().min(1, "Booking date is required"),
    bookingHour: z.string().optional(), // Deprecated, optional for backward compatibility
    timeSlots: z
      .array(bookingTimeSlotSchema)
      .min(1, "At least one time slot is required"),
    duration: z.number().min(1, "Duration is required"),
    totalPrice: z.number().min(1, "Total price is required"),
    status: z.string().min(1, "Status is required"),
  })
  .refine(
    (data) => {
      // Duration should match timeSlots length
      return data.duration === data.timeSlots.length;
    },
    {
      message: "Duration must match the number of time slots",
      path: ["duration"],
    }
  );

export type BookingCreateData = z.infer<typeof bookingCreateSchema>;
export type BookingUpdateData = z.infer<typeof bookingUpdateSchema>;
