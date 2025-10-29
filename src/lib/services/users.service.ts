import { prisma } from "@/lib/prisma";
import { UserCreateData, UserDeleteData } from "../validations/user.validation";
import { Prisma } from "@prisma/client";
import { UserStatus } from "@/types/prisma";
import { ServiceContext, requirePermission } from "@/types/service-context";
import { Role } from "@/types/prisma";

export const usersService = {
  getUsers: async (context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.ADMIN);
      if (accessError) return accessError;

      // Get all users
      const users = await prisma.user.findMany({
        where: { isArchived: false },
        include: { profile: true },
        orderBy: { createdAt: "desc" },
      });

      // Filter users berdasarkan role dan venue assignment
      const filteredUsers = users.filter((user) => {
        // SUPER_ADMIN bisa lihat semua users
        if (context.userRole === Role.SUPER_ADMIN) {
          return true;
        }
        
        // ADMIN hanya bisa lihat users di venue yang sama
        if (context.userRole === Role.ADMIN) {
          return user.assignedVenueId === context.assignedVenueId;
        }
        
        return false; // Role lain tidak bisa akses
      });

      const usersWithoutPasswords = filteredUsers.map(({ password, ...user }) => user);

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

  createUser: async (data: UserCreateData, context: ServiceContext, tx?: Prisma.TransactionClient) => {
    try {
      const accessError = requirePermission(context, Role.SUPER_ADMIN);
      if (accessError) return accessError;

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
          data: null,
          message: error instanceof Error ? error.message : "Failed to create user",
      }
    }
  },

  deleteUser: async (data: UserDeleteData, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.SUPER_ADMIN);
      if (accessError) return accessError;

      await prisma.user.update({
        where: { id: data.userId },
        data: { isArchived: true },
      });
      return {
        success: true,
        message: "User deleted successfully",
      };
    } catch (error) {
      console.error("Delete user error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete user",
      };
    }
  },
};
