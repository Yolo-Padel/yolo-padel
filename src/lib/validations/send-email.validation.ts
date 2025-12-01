import { UserType } from "@/types/prisma";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email format");

export const invitationEmailSchema = z.object({
  userType: z.nativeEnum(UserType),
  email: emailSchema,
  userName: z.string().min(1, "User name is required"),
  invitationUrl: z.string().url("Invalid URL format"),
});

export const resetPasswordEmailSchema = z.object({
  email: emailSchema,
  customerName: z.string().min(1, "Customer name is required"),
  resetUrl: z.string().url("Invalid URL format"),
});

export const confirmationEmailSchema = z.object({
  email: emailSchema,
  userName: z.string().min(1, "User name is required"),
  confirmationUrl: z.string().url("Invalid URL format"),
});

const bookingSchema = z.object({
  court: z.string().min(1, "Court name is required"),
  date: z.string().refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    {
      message: "Invalid date format",
    }
  ),
  time: z.string().min(1, "Time is required"),
  bookingCode: z.string().min(1, "Booking code is required"),
  location: z.string().min(1, "Location is required"),
});

// Base schema for single booking (used by reschedule and cancelation)
const bookingEmailBaseSchema = z.object({
  orderCode: z.string().min(1, "Order code is required"),
  email: emailSchema,
  customerName: z.string().min(1, "Customer name is required"),
  court: z.string().min(1, "Court name is required"),
  date: z.string().refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    {
      message: "Invalid date format",
    }
  ),
  time: z.string().min(1, "Time is required"),
  bookingCode: z.string().min(1, "Booking code is required"),
  location: z.string().min(1, "Location is required"),
});

// Schema for order confirmation email with multiple bookings
export const orderConfirmationEmailSchema = z.object({
  orderCode: z.string().min(1, "Order code is required"),
  email: emailSchema,
  customerName: z.string().min(1, "Customer name is required"),
  bookings: z.array(bookingSchema).min(1, "At least one booking is required"),
});

export const bookingRescheduleEmailSchema = bookingEmailBaseSchema.extend({
  status: z.string().min(1, "Status is required"),
});

export const bookingCancelationEmailSchema = bookingEmailBaseSchema.extend({
  status: z.string().min(1, "Status is required"),
});

const timeSchema = z
  .string()
  .regex(
    /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    "Invalid time format (expected HH:MM)"
  );

export const manualBookingConfirmationEmailSchema = z.object({
  email: emailSchema,
  customerName: z.string().optional(),
  court: z.string().min(1, "Court name is required"),
  venue: z.string().min(1, "Venue name is required"),
  date: z.string().refine(
    (date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    },
    {
      message: "Invalid date format",
    }
  ),
  startTime: timeSchema,
  endTime: z
    .string()
    .regex(
      /^(?:([0-1]?[0-9]|2[0-3]):[0-5][0-9]|24:00)$/,
      "Invalid end time format"
    ),
  bookingCode: z.string().min(1, "Booking code is required"),
  loginUrl: z.string().url("Invalid login URL"),
});

export type InvitationEmailData = z.infer<typeof invitationEmailSchema>;
export type ResetPasswordEmailData = z.infer<typeof resetPasswordEmailSchema>;
export type ConfirmationEmailData = z.infer<typeof confirmationEmailSchema>;
export type BookingRescheduleEmailData = z.infer<
  typeof bookingRescheduleEmailSchema
>;
export type BookingCancelationEmailData = z.infer<
  typeof bookingCancelationEmailSchema
>;
export type OrderConfirmationEmailData = z.infer<
  typeof orderConfirmationEmailSchema
>;
export type ManualBookingConfirmationEmailData = z.infer<
  typeof manualBookingConfirmationEmailSchema
>;
