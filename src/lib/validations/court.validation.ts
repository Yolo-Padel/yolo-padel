import { z } from "zod";
import { OpeningHoursType } from "@/types/prisma";

// Time slot schema for schedule
const timeSlotSchema = z.object({
  openHour: z.string().min(1, "Open hour is required"),
  closeHour: z.string().min(1, "Close hour is required"),
});

// Day schedule schema
const dayScheduleSchema = z.object({
  closed: z.boolean(),
  timeSlots: z.array(timeSlotSchema).optional(),
});


// Main court creation schema
export const courtCreateSchema = z
  .object({
    courtName: z
      .string()
      .min(1, "Court name is required")
      .max(100, "Court name must be less than 100 characters"),
    venueId: z.string().min(1, "Venue ID is required"),
    price: z.number().min(0, "Price must be a positive number"),
    openingHours: z.nativeEnum(OpeningHoursType),
    schedule: z.object({
      monday: dayScheduleSchema,
      tuesday: dayScheduleSchema,
      wednesday: dayScheduleSchema,
      thursday: dayScheduleSchema,
      friday: dayScheduleSchema,
      saturday: dayScheduleSchema,
      sunday: dayScheduleSchema,
    }),
  })
  .refine(
    (data) => {
      // If opening hours is WITHOUT_FIXED, validate that schedule has proper time slots
      if (data.openingHours === OpeningHoursType.WITHOUT_FIXED) {
        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
        return days.every((day) => {
          const dayData = data.schedule[day];
          return (
            dayData.closed ||
            (dayData.timeSlots && dayData.timeSlots.length > 0)
          );
        });
      }
      return true;
    },
    {
      message:
        "When using custom hours, each day must either be closed or have at least one time slot",
      path: ["schedule"],
    }
  );

export const courtDeleteSchema = z.object({
  courtId: z.string().min(1, "Court ID is required"),
});

// Types
export type TimeSlot = z.infer<typeof timeSlotSchema>;
export type DaySchedule = z.infer<typeof dayScheduleSchema>;
export type CourtCreateData = z.infer<typeof courtCreateSchema>;

// OLD VALIDATION (kept for reference)
// export const courtCreateSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   isActive: z.boolean(),
//   isArchived: z.boolean().default(false),
//   venueId: z.string().min(1, "Venue ID is required"),
//   location: z.string().min(1, "Location is required"),
//   images: z.array(z.string().url("Invalid image URL")),
// });

// export type CourtCreateInput = z.infer<typeof courtCreateSchema>;
