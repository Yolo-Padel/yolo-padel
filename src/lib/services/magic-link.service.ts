import { prisma } from "@/lib/prisma";
import { UserStatus } from "@/types/prisma";
import * as crypto from "crypto";

export interface MagicLinkResult {
  success: boolean;
  message: string;
  token?: string;
}

export interface VerifyMagicLinkResult {
  success: boolean;
  message: string;
  email?: string;
}

class MagicLinkService {
  private readonly TOKEN_EXPIRY_MINUTES = 15;

  /**
   * Generate a secure random token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Clean up expired magic links
   */
  async cleanupExpiredLinks(): Promise<void> {
    await prisma.magicLink.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Generate a magic link for the given email
   */
  async generateMagicLink(email: string): Promise<MagicLinkResult> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Clean up old links for this email
      await prisma.magicLink.deleteMany({
        where: { email },
      });

      // Generate new token
      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + this.TOKEN_EXPIRY_MINUTES);

      // Save magic link to database
      await prisma.magicLink.create({
        data: {
          email,
          token,
          expiresAt,
        },
      });

      return {
        success: true,
        message: "Magic link created successfully",
        token,
      };
    } catch (error) {
      console.error("Error generating magic link:", error);
      return {
        success: false,
        message: "Error creating magic link",
      };
    }
  }

  /**
   * Verify a magic link token
   */
  async verifyMagicLink(token: string): Promise<VerifyMagicLinkResult> {
    try {
      // Find the magic link
      const magicLink = await prisma.magicLink.findUnique({
        where: { token },
      });

      if (!magicLink) {
        // Check if there are any magic links in the database
        const allLinks = await prisma.magicLink.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
        });

        return {
          success: false,
          message: "Magic link is invalid",
        };
      }

      // Check if already used
      if (magicLink.used) {
        return {
          success: false,
          message: "Magic link has already been used",
        };
      }

      // Check if expired
      if (magicLink.expiresAt < new Date()) {
        return {
          success: false,
          message: "Magic link has expired",
        };
      }

      // Mark as used
      await prisma.magicLink.update({
        where: { id: magicLink.id },
        data: { used: true },
      });

      // Update user - only set joinDate if it's the first time (joinDate is null)
      const user = await prisma.user.findUnique({
        where: { email: magicLink.email },
        select: { joinDate: true },
      });

      const updateData: any = {};

      // Only set joinDate if it's the first time user verifies magic link
      if (!user?.joinDate) {
        updateData.joinDate = new Date();
        updateData.userStatus = UserStatus.JOINED;
        updateData.isEmailVerified = true;
      }

      await prisma.user.update({
        where: { email: magicLink.email },
        data: updateData,
      });

      return {
        success: true,
        message: "Magic link verified successfully",
        email: magicLink.email,
      };
    } catch (error) {
      console.error("Error verifying magic link:", error);
      return {
        success: false,
        message: "Error verifying magic link",
      };
    }
  }
}

export const magicLinkService = new MagicLinkService();
