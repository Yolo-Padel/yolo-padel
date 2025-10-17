import { z } from "zod";

export const courtCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isActive: z.boolean(),
  isArchived: z.boolean().default(false),
  venueId: z.string().min(1, "Venue ID is required"),
});

export type CourtCreateInput = z.infer<typeof courtCreateSchema>;
