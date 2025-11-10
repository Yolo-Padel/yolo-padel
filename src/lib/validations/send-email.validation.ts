import { Role } from "@/types/prisma";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email format");

export const invitationEmailSchema = z.object({
  role: z.nativeEnum(Role),
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
  bookingId: z.string().min(1, "Booking ID is required"),
  location: z.string().min(1, "Location is required"),
});

// Base schema for single booking (used by reschedule and cancelation)
const bookingEmailBaseSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
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
  bookingId: z.string().min(1, "Booking ID is required"),
  location: z.string().min(1, "Location is required"),
});

// Schema for order confirmation email with multiple bookings
export const orderConfirmationEmailSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
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
