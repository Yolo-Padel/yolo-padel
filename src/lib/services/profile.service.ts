import { prisma } from "@/lib/prisma";
import { ProfileCreateData, ProfileUpdateData } from "../validations/profile.validation";
import { Prisma } from "@prisma/client";
import {
  activityLogService,
  entityReferenceHelpers,
} from "@/lib/services/activity-log.service";
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
          phoneNumber: data.phoneNumber,
          avatar: data.avatar,
        },
      });
      // audit log (entityType USER untuk perubahan profile)
      if (context) {
        // Fetch user email for entity reference
        const user = await (tx || prisma).user.findUnique({
          where: { id: userId },
          select: { email: true },
        });

        activityLogService.record({
          context,
          action: ACTION_TYPES.CREATE_PROFILE,
          entityType: ENTITY_TYPES.USER,
          entityId: userId,
          entityReference: entityReferenceHelpers.user({
            email: user?.email || "",
            profile: { fullName: data.fullName },
          }),
          changes: { before: {}, after: { fullName: data.fullName } } as any,
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
          phoneNumber: data.phoneNumber,
          avatar: data.avatar,
        },
      });

      if (context) {
        // Fetch user email for entity reference
        const userForRef = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });

        activityLogService.record({
          context,
          action: ACTION_TYPES.UPDATE_PROFILE,
          entityType: ENTITY_TYPES.USER,
          entityId: userId,
          entityReference: entityReferenceHelpers.user({
            email: userForRef?.email || "",
            profile: { fullName: data.fullName },
          }),
          changes: { fullName: data.fullName },
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
