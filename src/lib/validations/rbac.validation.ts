import { z } from "zod";

const permissionItemSchema = z.object({
  moduleId: z.string().min(1, "Module wajib diisi"),
  permissionId: z.string().min(1, "Permission wajib diisi"),
  allowed: z.boolean(),
});

export const createRoleSchema = z.object({
  name: z.string().min(3, "Nama role minimal 3 karakter"),
  description: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  permissions: z.array(permissionItemSchema).optional(),
});

export const updateRoleSchema = z
  .object({
    name: z.string().min(3).optional(),
    description: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Minimal satu field harus diisi",
  });

export const updateRolePermissionsSchema = z.object({
  permissions: z
    .array(permissionItemSchema)
    .min(1, "Minimal satu permission untuk diperbarui"),
});

