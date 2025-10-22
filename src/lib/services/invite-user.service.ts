import { UserCreateData } from "../validations/user.validation";
import { magicLinkService } from "./magic-link.service";
import { profileService } from "./profile.service";
import { usersService } from "./users.service";
import { resendService } from "./resend.service";
import { prisma } from "@/lib/prisma";

export const inviteUserService = {
    inviteUser: async (data: UserCreateData) => {
        try {
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
                const user = await usersService.createUser(data, tx);
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
            const email = await resendService.sendAdminInvitationEmail({
                email: inviteResult.data!.user.email,
                userName: data.fullName,
                invitationUrl: process.env.NEXT_PUBLIC_APP_URL + "/admin/auth/verify?token=" + magicLink.token!,
            });

            console.log("email", email);

            if (!email.success) {
                return {
                    success: false,
                    data: null,
                    message: email.message,
                };
            }

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