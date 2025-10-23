import { z } from "zod";

export const venueCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  description: z.string().optional(),
  images: z.array(z.string().url("Invalid image URL")),
});

export const venueDeleteSchema = z.object({
  venueId: z.string().min(1, "Venue ID is required"),
});

export type VenueCreateData = z.infer<typeof venueCreateSchema>;
export type VenueDeleteData = z.infer<typeof venueDeleteSchema>;
