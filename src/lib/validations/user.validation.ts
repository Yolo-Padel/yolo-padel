import { Role } from "@/types/prisma";
import { z } from "zod";

export const userCreateSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.nativeEnum(Role),
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(64, "Full name must be less than 64 characters"),
  assignedVenueIds: z.array(z.string()).default([]),
  membershipId: z.string().optional(),
});

export const userDeleteSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const userUpdateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  email: z.string().email("Invalid email format"),
  role: z.nativeEnum(Role),
  fullName: z
    .string()
    .min(1, "Full name is required")
    .max(64, "Full name must be less than 64 characters"),
  assignedVenueIds: z.array(z.string()).default([]),
  membershipId: z.string().optional(),
});

export const userResendInviteSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type UserCreateData = z.infer<typeof userCreateSchema>;
export type UserDeleteData = z.infer<typeof userDeleteSchema>;
export type UserUpdateData = z.infer<typeof userUpdateSchema>;
export type UserResendInviteData = z.infer<typeof userResendInviteSchema>;
