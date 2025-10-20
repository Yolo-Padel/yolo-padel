import { z } from "zod";
import { Role } from "@prisma/client";

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
    role: z.nativeEnum(Role),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});


export const profileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(64, "First name must be less than 64 characters"),
  lastName: z.string().min(1, "Last name is required").max(64, "Last name must be less than 64 characters"),
});

export type RegisterFormInput = z.infer<typeof registerFormSchema>;
export type LoginFormInput = z.infer<typeof loginFormSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Legacy type aliases for backward compatibility
export type RegisterFormData = RegisterFormInput;
export type LoginFormData = LoginFormInput;
