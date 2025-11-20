import { z } from "zod";

/**
 * Validation schema for guest user creation
 */
export const guestUserCreateSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters"),
});

export type GuestUserCreateData = z.infer<typeof guestUserCreateSchema>;

