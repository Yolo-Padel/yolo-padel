import { z } from "zod";
import { DayOfWeek } from "@/types/prisma";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const dayOfWeekSchema = z.nativeEnum(DayOfWeek).optional().nullable();

const dateSchema = z
  .union([z.string(), z.date()])
  .optional()
  .nullable()
  .transform((value) => {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  })
  .refine((value) => {
    if (!value) return true;
    return !Number.isNaN(value.getTime());
  }, "Invalid date format");

export const courtDynamicPriceCreateSchema = z
  .object({
    courtId: z.string().min(1, "courtId is required"),
    dayOfWeek: dayOfWeekSchema,
    date: dateSchema,
    startHour: z
      .string()
      .regex(timeRegex, "startHour must use HH:MM 24-hour format"),
    endHour: z
      .string()
      .regex(timeRegex, "endHour must use HH:MM 24-hour format"),
    price: z.number().int().positive("price must be a positive integer"),
    isActive: z.boolean().optional().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.startHour >= data.endHour) {
      ctx.addIssue({
        path: ["endHour"],
        code: z.ZodIssueCode.custom,
        message: "endHour must be later than startHour",
      });
    }

    if (data.dayOfWeek && data.date) {
      ctx.addIssue({
        path: ["date"],
        code: z.ZodIssueCode.custom,
        message: "Use either dayOfWeek or date, not both",
      });
    }
  });

export const courtDynamicPriceUpdateSchema = courtDynamicPriceCreateSchema
  .omit({ courtId: true })
  .partial()
  .superRefine((data, ctx) => {
    if (
      data.startHour !== undefined &&
      data.endHour !== undefined &&
      data.startHour >= data.endHour
    ) {
      ctx.addIssue({
        path: ["endHour"],
        code: z.ZodIssueCode.custom,
        message: "endHour must be later than startHour",
      });
    }

    if (data.dayOfWeek && data.date) {
      ctx.addIssue({
        path: ["date"],
        code: z.ZodIssueCode.custom,
        message: "Use either dayOfWeek or date, not both",
      });
    }

    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one field must be provided for update",
      });
    }
  });

export type CourtDynamicPriceCreateData = z.infer<
  typeof courtDynamicPriceCreateSchema
>;

export type CourtDynamicPriceUpdateData = z.infer<
  typeof courtDynamicPriceUpdateSchema
>;

