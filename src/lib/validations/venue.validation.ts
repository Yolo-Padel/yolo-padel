import { z } from "zod";

// Create Venue
// Form schema for create/edit (with consistent types for react-hook-form)
export const venueFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  address: z.string().default(""),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  city: z.string().default(""),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Create schema (for API)
export const venueCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url("Invalid image URL")).optional().default([]),
  city: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

// Update schema (for API)
export const venueUpdateSchema = z.object({
  venueId: z.string().min(1, "Venue ID is required"),
  name: z.string().min(1, "Name is required").optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url("Invalid image URL")).optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Delete Venue (soft delete)
export const venueDeleteSchema = z.object({
  venueId: z.string().min(1, "Venue ID is required"),
});

export type VenueFormData = z.infer<typeof venueFormSchema>;
export type VenueCreateData = z.infer<typeof venueCreateSchema>;
export type VenueUpdateData = z.infer<typeof venueUpdateSchema>;
export type VenueDeleteData = z.infer<typeof venueDeleteSchema>;
