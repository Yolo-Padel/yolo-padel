import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { Role } from "@/types/prisma";
import {
  RegisterFormData,
  LoginFormData,
} from "../validations/auth.validation";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";
const JWT_EXPIRES_IN = "7d";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export const authService = {
  register: async (data: RegisterFormData) => {
    try {
      // 1. Check existing user
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        return {
          success: false,
          data: null,
          message: "Email already registered",
        };
      }

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(process.env.DUMMY_PASSWORD || "", 12);

      // 3. Create user and profile in transaction
      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          // Create user
          const user = await tx.user.create({
            data: {
              email: data.email,
              password: hashedPassword,
              role: data.role || Role.USER,
            },
          });

          const profile = await tx.profile.create({
            data: {
              userId: user.id,
              fullName: data.name,
            },
          });

          return { user, profile };
        }
      );

      // 4. Generate JWT token (jose)
      const token = await new SignJWT({
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(secretKey);

      const { password, ...userWithoutPassword } = result.user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          profile: result.profile,
          token,
        },
        message: "Registration successful",
      };
    } catch (error) {
      console.error("Register error:", error);

      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Registration failed",
      };
    }
  },

  login: async (data: LoginFormData) => {
    try {
      // 1. Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
          profile: true,
        },
      });

      if (!user) {
        return {
          success: false,
          data: null,
          message: "Invalid email or password",
        };
      }

      // 2. Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          data: null,
          message: "Invalid email or password",
        };
      }
      // 3. Generate JWT token (jose)
      const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(secretKey);

      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          profile: user.profile,
          token,
        },
        message: "Login successful",
      };
    } catch (error) {
      console.error("Login error:", error);

      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Login failed",
      };
    }
  },

  verifyToken: async (token: string) => {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      const decoded = payload as any;

      // Get fresh user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { profile: true },
      });

      if (!user) {
        return { success: false, data: null };
      }

      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          profile: user.profile,
        },
      };
    } catch (error) {
      return { success: false, data: null };
    }
  },

};
