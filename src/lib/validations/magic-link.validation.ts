import { z } from "zod";

export const magicLinkRequestSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const magicLinkVerifySchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export const magicLinkExtendSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export type MagicLinkRequestInput = z.infer<typeof magicLinkRequestSchema>;
export type MagicLinkVerifyInput = z.infer<typeof magicLinkVerifySchema>;
export type MagicLinkExtendInput = z.infer<typeof magicLinkExtendSchema>;
