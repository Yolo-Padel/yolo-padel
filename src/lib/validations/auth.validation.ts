import { z } from "zod";
import { UserType } from "@/types/prisma";

export const registerFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    userType: z.nativeEnum(UserType),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const loginWithMagicLinkSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type RegisterFormInput = z.infer<typeof registerFormSchema>;
export type LoginFormInput = z.infer<typeof loginFormSchema>;
export type LoginWithMagicLinkInput = z.infer<typeof loginWithMagicLinkSchema>;

// Legacy type aliases for backward compatibility
export type RegisterFormData = RegisterFormInput;
export type LoginFormData = LoginFormInput;
export type LoginWithMagicLinkData = LoginWithMagicLinkInput;
