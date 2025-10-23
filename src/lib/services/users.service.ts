import { prisma } from "@/lib/prisma";
import { UserCreateData } from "../validations/user.validation";
import { Prisma } from "@prisma/client";
import { UserStatus } from "@/types/prisma";

export const usersService = {
  getUsers: async () => {
    try {
      // Get all users
      const users = await prisma.user.findMany({
        include: { profile: true },
        orderBy: { createdAt: "desc" },
      });

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

  createUser: async (data: UserCreateData, tx?: Prisma.TransactionClient) => {
    try {
      const user = await (tx || prisma).user.create({
        data: {
          email: data.email,
          role: data.role,
          userStatus: UserStatus.INVITED,
          assignedVenueId: data.assignedVenueId || null,
        },
      });
      return {
        success: true,
        data: user,
        message: "User created successfully",
      };
    } catch (error) {
      console.error("Create user error:", error);
      return {
        success: false,
    }
    }
  },
  // Future: Add more users management functions
  // createUser, updateUser, deleteUser, etc.
};
