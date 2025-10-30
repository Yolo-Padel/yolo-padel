import { prisma } from "@/lib/prisma";
import { UserCreateData, UserDeleteData, UserUpdateData } from "../validations/user.validation";
import { Prisma } from "@prisma/client";
import { UserStatus } from "@/types/prisma";
import { ServiceContext, requirePermission } from "@/types/service-context";
import { Role } from "@/types/prisma";
import { activityLogService } from "@/lib/services/activity-log.service";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";

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

      const usersWithoutPasswords = users.map(({ password, ...user }) => user);

      // Build invitation state for INVITED users (no schema changes)
      const invitedEmails = usersWithoutPasswords
        .filter(u => u.userStatus === UserStatus.INVITED)
        .map(u => u.email);

      const emailToLatestLink: Record<string, { used: boolean; expiresAt: Date } | undefined> = {};
      if (invitedEmails.length > 0) {
        const links = await prisma.magicLink.findMany({
          where: { email: { in: invitedEmails } },
          orderBy: [{ email: 'asc' }, { createdAt: 'desc' }],
        });
        for (const link of links) {
          if (!emailToLatestLink[link.email]) {
            emailToLatestLink[link.email] = { used: link.used, expiresAt: link.expiresAt } as any;
          }
        }
      }

      const now = new Date();
      const usersWithInvitation = usersWithoutPasswords.map(u => {
        if (u.userStatus !== UserStatus.INVITED) return u as any;
        const latest = emailToLatestLink[u.email];
        let state: 'valid' | 'expired' | 'used' | 'none' = 'none';
        let expiresAt: Date | undefined = undefined;
        if (latest) {
          expiresAt = latest.expiresAt;
          if (latest.used) state = 'used';
          else if (latest.expiresAt < now) state = 'expired';
          else state = 'valid';
        }
        return {
          ...u,
          invitation: {
            state,
            expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
          },
        } as any;
      });

      return {
        success: true,
        data: {
          users: usersWithInvitation,
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
      // audit log (non-blocking)
      activityLogService.record({
        context,
        action: ACTION_TYPES.CREATE_USER,
        entityType: ENTITY_TYPES.USER,
        entityId: user.id,
        changes: {
          before: {},
          after: {
            email: user.email,
            role: user.role,
            assignedVenueId: user.assignedVenueId,
            userStatus: user.userStatus,
          }
        } as any,
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

  updateUser: async (data: UserUpdateData, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.SUPER_ADMIN);
      if (accessError) return accessError;

      const existing = await prisma.user.findUnique({
        where: { id: data.userId },
        include: { profile: true },
      });
      if (!existing || existing.isArchived) {
        return { success: false, data: null, message: "User not found" } as any;
      }

      const assignedVenueId = data.role === Role.USER ? null : (data.assignedVenueId ?? null);

      const updated = await prisma.user.update({
        where: { id: data.userId },
        data: {
          email: data.email,
          role: data.role,
          assignedVenueId,
        },
        include: { profile: true },
      });

      // Update or create profile fullName
      if (data.fullName) {
        const hasProfile = !!existing.profile;
        if (hasProfile) {
          await prisma.profile.update({ where: { userId: data.userId }, data: { fullName: data.fullName } });
        } else {
          await prisma.profile.create({ data: { userId: data.userId, fullName: data.fullName } });
        }
      }

      // audit log (minimal diff)
      activityLogService.record({
        context,
        action: ACTION_TYPES.UPDATE_USER,
        entityType: ENTITY_TYPES.USER,
        entityId: data.userId,
        changes: {
          before: {
            email: existing.email,
            role: existing.role,
            assignedVenueId: existing.assignedVenueId,
            fullName: existing.profile?.fullName ?? null,
          },
          after: {
            email: data.email,
            role: data.role,
            assignedVenueId,
            fullName: data.fullName,
          },
        } as any,
      });

      return {
        success: true,
        data: updated,
        message: "User updated successfully",
      } as any;
    } catch (error) {
      console.error("Update user error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Failed to update user",
      } as any;
    }
  },

  deleteUser: async (data: UserDeleteData, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.SUPER_ADMIN);
      if (accessError) return accessError;

      const updated = await prisma.user.update({
        where: { id: data.userId },
        data: { isArchived: true },
      });
      // audit log
      activityLogService.record({
        context,
        action: ACTION_TYPES.DELETE_USER,
        entityType: ENTITY_TYPES.USER,
        entityId: data.userId,
        changes: {
          before: { isArchived: false },
          after: { isArchived: true }
        } as any,
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
