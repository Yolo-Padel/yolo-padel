import { UserType } from "@/types/prisma";
import { z } from "zod";

export const userCreateSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    userType: z.nativeEnum(UserType),
    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(64, "Full name must be less than 64 characters"),
    assignedVenueIds: z.array(z.string()).default([]),
    membershipId: z.string().optional(),
    roleId: z.string().optional(),
  })
  .refine(
    (data) => {
      // STAFF users must have a roleId
      if (data.userType === UserType.STAFF) {
        return data.roleId && data.roleId.length > 0;
      }
      return true;
    },
    {
      message: "Access role is required for STAFF users",
      path: ["roleId"],
    }
  )
  .refine(
    (data) => {
      // ADMIN users should not have roleId or assignedVenueIds
      if (data.userType === UserType.ADMIN) {
        return (
          (!data.roleId || data.roleId === "") &&
          (!data.assignedVenueIds || data.assignedVenueIds.length === 0)
        );
      }
      return true;
    },
    {
      message: "ADMIN users should not have role or venue assignments",
      path: ["userType"],
    }
  );

export const userDeleteSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const userUpdateSchema = z
  .object({
    userId: z.string().min(1, "User ID is required"),
    email: z.string().email("Invalid email format"),
    userType: z.nativeEnum(UserType),
    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(64, "Full name must be less than 64 characters"),
    assignedVenueIds: z.array(z.string()).default([]),
    membershipId: z.string().optional(),
    roleId: z.string().optional(),
  })
  .refine(
    (data) => {
      // STAFF users must have a roleId
      if (data.userType === UserType.STAFF) {
        return data.roleId && data.roleId.length > 0;
      }
      return true;
    },
    {
      message: "Access role is required for STAFF users",
      path: ["roleId"],
    }
  )
  .refine(
    (data) => {
      // ADMIN users should not have roleId or assignedVenueIds
      if (data.userType === UserType.ADMIN) {
        return (
          (!data.roleId || data.roleId === "") &&
          (!data.assignedVenueIds || data.assignedVenueIds.length === 0)
        );
      }
      return true;
    },
    {
      message: "ADMIN users should not have role or venue assignments",
      path: ["userType"],
    }
  );

export const userResendInviteSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type UserCreateData = z.infer<typeof userCreateSchema>;
export type UserDeleteData = z.infer<typeof userDeleteSchema>;
export type UserUpdateData = z.infer<typeof userUpdateSchema>;
export type UserResendInviteData = z.infer<typeof userResendInviteSchema>;
