import { prisma } from "@/lib/prisma";

export const usersService = {
  getUsers: async () => {
    try {
      // Get all users
      const users = await prisma.user.findMany({
        include: { profile: true },
        orderBy: { createdAt: "desc" },
      });

      // Remove passwords from response
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);

      return {
        success: true,
        data: {
          users: usersWithoutPasswords,
        },
        message: "Users fetched successfully",
      };
    } catch (error) {
      console.error("Get users error:", error);
      return {
        success: false,
        data: null,
        message: "Failed to fetch users",
      };
    }
  },

  // Future: Add more users management functions
  // createUser, updateUser, deleteUser, etc.
};
