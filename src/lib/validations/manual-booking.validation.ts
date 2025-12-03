import { z } from "zod";

const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const endTimePattern = /^(?:([0-1]?[0-9]|2[0-3]):[0-5][0-9]|24:00)$/; // allow midnight for end time only

function isValidDate(value: string): boolean {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export const manualBookingSchema = z
  .object({
    venueId: z.string().min(1, "Venue is required"),
    courtId: z.string().min(1, "Court is required"),
    email: z.string().email("Invalid email format"),
    date: z
      .string()
      .min(1, "Date is required")
      .refine(isValidDate, "Invalid date format"),
    startTime: z
      .string()
      .regex(timePattern, "Start time must be in HH:mm format"),
    endTime: z
      .string()
      .regex(endTimePattern, "End time must be in HH:mm format"),
  })
  .refine(
    (data) => {
      const start = data.startTime.replace(":", "");
      const end = data.endTime.replace(":", "");
      return end > start;
    },
    {
      path: ["endTime"],
      message: "End time must be greater than start time",
    }
  )
  .refine(
    (data) => {
      const [, startMinute] = data.startTime.split(":").map(Number);
      const [, endMinute] = data.endTime.split(":").map(Number);
      return startMinute === 0 && endMinute === 0;
    },
    {
      path: ["startTime"],
      message: "Time must be in multiples of 1 hour (minutes = 00)",
    }
  );

export type ManualBookingInput = z.infer<typeof manualBookingSchema>;
