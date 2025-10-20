import { z } from "zod";

export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(64, "First name must be less than 64 characters"),
  lastName: z.string().min(1, "Last name is required").max(64, "Last name must be less than 64 characters"),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
