import { prisma } from "@/lib/prisma";
import { ProfileCreateData, ProfileUpdateData } from "../validations/profile.validation";
import { Prisma } from "@prisma/client";
import { activityLogService } from "@/lib/services/activity-log.service";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";
import { ServiceContext } from "@/types/service-context";

export const profileService = {
  createProfile: async (userId: string, data: ProfileCreateData, tx?: Prisma.TransactionClient, context?: ServiceContext) => {
    try {
      const profile = await (tx || prisma).profile.create({
        data: {
          userId,
          fullName: data.fullName,
        },
      });
      // audit log (entityType USER untuk perubahan profile)
      if (context) {
        activityLogService.record({
          context,
          action: ACTION_TYPES.CREATE_PROFILE,
          entityType: ENTITY_TYPES.USER,
          entityId: userId,
          changes: { before: {}, after: { fullName: data.fullName } } as any,
          description: "Create profile",
        });
      }
      return {
        success: true,
        data: profile,
        message: "Profile created successfully",
      };
    } catch (error) {
      console.error("Create profile error:", error);
      return {
        success: false,
        data: null,
        message: "Failed to create profile",
      };
    }
  },

  updateProfile: async (userId: string, data: ProfileUpdateData, context?: ServiceContext) => {
    try {
      // Update profile
      const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: {
          fullName: data.fullName,
        },
      });

      if (context) {
        activityLogService.record({
          context,
          action: ACTION_TYPES.UPDATE_PROFILE,
          entityType: ENTITY_TYPES.USER,
          entityId: userId,
          changes: { fullName: data.fullName },
          description: "Update profile",
        });
      }

      // Get updated user with profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user) {
        return {
          success: false,
          data: null,
          message: "User not found",
        };
      }

      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          profile: updatedProfile,
        },
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("Profile update error:", error);
      return {
        success: false,
        data: null,
        message: "Failed to update profile",
      };
    }
  },

  // Future: Add more profile management functions
  // updateAvatar, getProfile, etc.
};
