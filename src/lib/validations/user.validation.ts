import { Role } from "@prisma/client";
import { z } from "zod";

export const userCreateSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.nativeEnum(Role),
  fullName: z.string().min(1, "Full name is required").max(64, "Full name must be less than 64 characters"),
});

export type UserCreateData = z.infer<typeof userCreateSchema>;