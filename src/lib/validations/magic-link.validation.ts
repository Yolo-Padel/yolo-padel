import { z } from "zod";

export const magicLinkRequestSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const magicLinkVerifySchema = z.object({
  token: z.string().min(1, "Token diperlukan"),
});

export type MagicLinkRequestInput = z.infer<typeof magicLinkRequestSchema>;
export type MagicLinkVerifyInput = z.infer<typeof magicLinkVerifySchema>;