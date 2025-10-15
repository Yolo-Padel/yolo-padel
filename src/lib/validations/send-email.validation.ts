import { z } from "zod";

const emailSchema = z.string().email("Invalid email format");

export const adminInvitationEmailSchema = z.object({
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

const bookingEmailBaseSchema = z.object({
  email: emailSchema,
  customerName: z.string().min(1, "Customer name is required"),
  court: z.string().min(1, "Court name is required"),
  date: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, {
    message: "Invalid date format"
  }),
  time: z.string().min(1, "Time is required"),
  bookingId: z.string().min(1, "Booking ID is required"),
  location: z.string().min(1, "Location is required"),
});

export const bookingRescheduleEmailSchema = bookingEmailBaseSchema.extend({
  status: z.string().min(1, "Status is required"),
});

export const bookingCancelationEmailSchema = bookingEmailBaseSchema.extend({
  status: z.string().min(1, "Status is required"),
});

export const bookingConfirmationEmailSchema = bookingEmailBaseSchema;

export type AdminInvitationEmailData = z.infer<typeof adminInvitationEmailSchema>;
export type ResetPasswordEmailData = z.infer<typeof resetPasswordEmailSchema>;
export type ConfirmationEmailData = z.infer<typeof confirmationEmailSchema>;
export type BookingRescheduleEmailData = z.infer<typeof bookingRescheduleEmailSchema>;
export type BookingCancelationEmailData = z.infer<typeof bookingCancelationEmailSchema>;
export type BookingConfirmationEmailData = z.infer<typeof bookingConfirmationEmailSchema>;