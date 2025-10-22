import { prisma } from "@/lib/prisma";
import { UserCreateData } from "../validations/user.validation";
import { Prisma } from "@prisma/client";

export const usersService = {
  getUsers: async () => {
    try {
      // Get all users
      const users = await prisma.user.findMany({
        include: { profile: true },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        data: {
          users: users,
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

  // inviteUser: async (email: string, role: Role, fullName: string) => {
  //   try {
  //     const user = await prisma.user.create({
  //       data: {
  //         email,
  //         role,
  //         profile: {
  //           create: {
  //             fullName,
  //           },
  //         },
  //       },
  //     });

  //     return {
  //       success: true,
  //       data: user,
  //       message: "User invited successfully",
  //     };
  //   } catch (error) {
  //     console.error("Invite user error:", error);
  //     return {
  //       success: false,
  //       data: null,
  //       message: "Failed to invite user",
  //     };
  //   }
  // },
  // Future: Add more users management functions
  // createUser, updateUser, deleteUser, etc.
};
