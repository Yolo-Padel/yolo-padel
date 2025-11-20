import { z } from "zod";

const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const endTimePattern = /^(?:([0-1]?[0-9]|2[0-3]):[0-5][0-9]|24:00)$/; // allow midnight for end time only

function isValidDate(value: string): boolean {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

export const manualBookingSchema = z
  .object({
    venueId: z.string().min(1, "Venue wajib diisi"),
    courtId: z.string().min(1, "Court wajib diisi"),
    email: z.string().email("Format email tidak valid"),
    date: z
      .string()
      .min(1, "Tanggal wajib diisi")
      .refine(isValidDate, "Format tanggal tidak valid"),
    startTime: z.string().regex(timePattern, "Format waktu mulai harus HH:mm"),
    endTime: z
      .string()
      .regex(endTimePattern, "Format waktu selesai harus HH:mm"),
  })
  .refine(
    (data) => {
      const start = data.startTime.replace(":", "");
      const end = data.endTime.replace(":", "");
      return end > start;
    },
    {
      path: ["endTime"],
      message: "Waktu selesai harus lebih besar dari waktu mulai",
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
      message: "Waktu harus menggunakan kelipatan 1 jam (menit = 00)",
    }
  );

export type ManualBookingInput = z.infer<typeof manualBookingSchema>;
