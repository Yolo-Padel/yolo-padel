import { UserCreateData } from "../validations/user.validation";
import { magicLinkService } from "./magic-link.service";
import { profileService } from "./profile.service";
import { usersService } from "./users.service";
import { resendService } from "./resend.service";
import { prisma } from "@/lib/prisma";
import { RequestContext } from "@/types/request-context";
import { requireModulePermission } from "@/lib/rbac/permission-checker";
import { activityLogService } from "@/lib/services/activity-log.service";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";
import { usersServiceMetadata } from "./users.service";

// Service metadata for RBAC
export const inviteUserServiceMetadata = {
  moduleKey: "user", // Orchestration service, akses users table
  serviceName: "inviteUserService",
  description: "User invitation operations",
} as const;

export const inviteUserService = {
  inviteUser: async (data: UserCreateData, context: RequestContext) => {
    try {
      const accessError = await requireModulePermission(
        context,
        inviteUserServiceMetadata.moduleKey,
        "create"
      );
      if (accessError) return accessError;
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          data: null,
          message: "User already registered",
        };
      }

      const inviteResult = await prisma.$transaction(async (tx) => {
        const user = await usersService.createUser(data, context as any, tx);
        if (!user.success) {
          return {
            success: false,
            data: null,
            message: user.message,
          };
        }
        const profile = await profileService.createProfile(
          user.data!.id,
          {
            fullName: data.fullName,
          },
          tx
        );

        if (!profile.success) {
          return {
            success: false,
            data: null,
            message: profile.message,
          };
        }

        return {
          success: true,
          data: {
            user: user.data!,
            profile: profile.data!,
          },
          message: "User invited successfully",
        };
      });

      // Generate magic link
      const magicLink = await magicLinkService.generateMagicLink(
        inviteResult.data!.user.email
      );

      if (!magicLink.success) {
        return {
          success: false,
          data: null,
          message: magicLink.message,
        };
      }

      // Send email
      const email = await resendService.sendInvitationEmail({
        email: inviteResult.data!.user.email,
        userName: data.fullName,
        invitationUrl:
          process.env.NEXT_PUBLIC_APP_URL +
          "/auth/verify?token=" +
          magicLink.token!,
        role: data.role,
      });

      console.log("email", email);

      if (!email.success) {
        return {
          success: false,
          data: null,
          message: email.message,
        };
      }

      // audit log
      activityLogService.record({
        context: {
          actorUserId: context.actorUserId,
        } as any, // activityLogService masih pakai ServiceContext, akan di-migrate nanti
        action: ACTION_TYPES.INVITE_USER,
        entityType: ENTITY_TYPES.USER,
        entityId: inviteResult.data!.user.id,
        changes: {
          before: {},
          after: {
            email: inviteResult.data!.user.email,
            role: data.role,
            assignedVenueId: inviteResult.data!.user.assignedVenueIds,
          },
        } as any,
      });

      return {
        success: true,
        data: inviteResult.data!,
        message: "User invited successfully",
      };
    } catch (error) {
      console.error("Invite user error:", error);
      return {
        success: false,
        data: null,
        message: "Failed to invite user",
      };
    }
  },
  resendInvitation: async (userId: string, context: RequestContext) => {
    try {
      const accessError = await requireModulePermission(
        context,
        inviteUserServiceMetadata.moduleKey,
        "update"
      );
      if (accessError) return accessError;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user || user.isArchived) {
        return {
          success: false,
          data: null,
          message: "User not found",
        };
      }

      // Generate fresh magic link
      const magicLink = await magicLinkService.generateMagicLink(user.email);
      if (!magicLink.success || !magicLink.token) {
        return {
          success: false,
          data: null,
          message: magicLink.message,
        };
      }

      const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${magicLink.token}`;
      const fullName = user.profile?.fullName || user.email;

      const emailResult = await resendService.sendInvitationEmail({
        email: user.email,
        userName: fullName,
        invitationUrl,
        role: user.role,
      } as any);

      if (!emailResult.success) {
        return {
          success: false,
          data: null,
          message: emailResult.message,
        };
      }

      activityLogService.record({
        context: {
          actorUserId: context.actorUserId,
        } as any, // activityLogService masih pakai ServiceContext, akan di-migrate nanti
        action: ACTION_TYPES.INVITE_USER,
        entityType: ENTITY_TYPES.USER,
        entityId: user.id,
        changes: {
          before: {},
          after: { resend: true, email: user.email },
        } as any,
      });

      return {
        success: true,
        data: null,
        message: "Invitation resent successfully",
      };
    } catch (error) {
      console.error("Resend invitation error:", error);
      return {
        success: false,
        data: null,
        message: "Failed to resend invitation",
      };
    }
  },
};
