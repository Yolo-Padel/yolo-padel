import { prisma } from "@/lib/prisma";
import { ProfileUpdateData } from "../validations/profile.validation";

export const profileService = {
  updateProfile: async (userId: string, data: ProfileUpdateData) => {
    try {
      // Update profile
      const updatedProfile = await prisma.profile.update({
        where: { userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
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

      // Remove password from response
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
