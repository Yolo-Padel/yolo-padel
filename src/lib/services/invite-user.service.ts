import { UserCreateData } from "../validations/user.validation";
import { magicLinkService } from "./magic-link.service";
import { profileService } from "./profile.service";
import { usersService } from "./users.service";
import { resendService } from "./resend.service";
import { prisma } from "@/lib/prisma";
import { requirePermission, ServiceContext } from "@/types/service-context";
import { Role } from "@/types/prisma";
import { activityLogService } from "@/lib/services/activity-log.service";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";

export const inviteUserService = {
    inviteUser: async (data: UserCreateData, context: ServiceContext) => {
        try {
            const accessError = requirePermission(context, Role.SUPER_ADMIN);
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
                const user = await usersService.createUser(data, context, tx);
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
            })

            // Generate magic link
            const magicLink = await magicLinkService.generateMagicLink(inviteResult.data!.user.email);

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
                invitationUrl: process.env.NEXT_PUBLIC_APP_URL + "/auth/verify?token=" + magicLink.token!,
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
                context,
                action: ACTION_TYPES.INVITE_USER,
                entityType: ENTITY_TYPES.USER,
                entityId: inviteResult.data!.user.id,
                changes: { before: {}, after: {
                    email: inviteResult.data!.user.email,
                    role: data.role,
                    assignedVenueId: inviteResult.data!.user.assignedVenueId,
                } } as any,
                description: "Invite user",
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
    }
}