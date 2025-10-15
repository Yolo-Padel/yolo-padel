import { z } from "zod";

export const courtCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isActive: z.boolean(),
  location: z.string().min(1, "Location is required"),
  images: z.array(z.string().url("Invalid image URL")),
});

export type CourtCreateInput = z.infer<typeof courtCreateSchema>;
