import { z } from "zod";

export const profileUpdateSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(64, "Full name must be less than 64 characters"),
});

export const profileCreateSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(64, "Full name must be less than 64 characters"),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type ProfileCreateData = z.infer<typeof profileCreateSchema>;