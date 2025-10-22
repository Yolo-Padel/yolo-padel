import { prisma } from "@/lib/prisma";
import { ProfileCreateData, ProfileUpdateData } from "../validations/profile.validation";
import { Prisma } from "@prisma/client";

export const profileService = {
  createProfile: async (userId: string, data: ProfileCreateData, tx?: Prisma.TransactionClient) => {
    try {
      const profile = await (tx || prisma).profile.create({
        data: {
          userId,
          fullName: data.fullName,
        },
      });
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

  updateProfile: async (userId: string, data: ProfileUpdateData) => {
    try {
      // Update profile
      const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: {
          fullName: data.fullName,
        },
      });

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
