import { z } from "zod";

export const venueCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  description: z.string().optional(),
  images: z.array(z.string().url("Invalid image URL")),
});

export type VenueCreateInput = z.infer<typeof venueCreateSchema>;
