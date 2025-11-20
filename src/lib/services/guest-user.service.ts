import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Role } from "@/types/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";
const JWT_EXPIRES_IN = "7d";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export const guestUserService = {
  /**
   * Create guest user with email and fullName
   * - Check if email already exists (if yes, return error)
   * - Create User (role: USER, password: null)
   * - Create Profile (fullName)
   * - Generate JWT token
   * - Return user, profile, and token
   */
  createGuestUser: async (email: string, fullName: string) => {
    try {
      // 1. Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return {
          success: false,
          data: null,
          message: "Email sudah terdaftar. Silakan login terlebih dahulu.",
        };
      }

      // 2. Create user and profile in transaction
      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          // Create user (password is deprecated, set to empty string)
          const user = await tx.user.create({
            data: {
              email,
              password: "", // Password deprecated, using magic link only
              role: Role.USER,
              userStatus: "ACTIVE",
            },
          });

          // Create profile
          const profile = await tx.profile.create({
            data: {
              userId: user.id,
              fullName,
            },
          });

          return { user, profile };
        }
      );

      // 3. Generate JWT token (same format as magic-link verify)
      const jwtToken = await new SignJWT({
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        assignedVenueId: result.user.assignedVenueIds,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(secretKey);

      // 4. Remove password from user object
      const { password, ...userWithoutPassword } = result.user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          profile: result.profile,
          token: jwtToken,
        },
        message: "Guest user created successfully",
      };
    } catch (error) {
      console.error("Create guest user error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create guest user",
      };
    }
  },
};

