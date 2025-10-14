import { SignJWT, jwtVerify } from 'jose';
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  RegisterFormData,
  LoginFormData,
} from "../validations/auth.validation";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-super-secret-key");
const JWT_EXPIRES_IN = "7d";

// Web Crypto API helper functions
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}

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
      const hashedPassword = await hashPassword(data.password);

      // 3. Create user and profile in transaction
      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          // Create user
          const user = await tx.user.create({
            data: {
              email: data.email,
              password: hashedPassword,
              role: data.role || "MEMBER",
            },
          });

          // Create profile - split name into firstName and lastName
          const nameParts = data.name.trim().split(" ");
          const firstName = nameParts[0] || data.name;
          const lastName = nameParts.slice(1).join(" ") || null;

          const profile = await tx.profile.create({
            data: {
              userId: user.id,
              firstName: firstName,
              lastName: lastName,
            },
          });

          return { user, profile };
        }
      );

      // 4. Generate JWT token
      const token = await new SignJWT({
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(JWT_SECRET);

      // 5. Remove password from response
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
      const isPasswordValid = await verifyPassword(
        data.password,
        user.password
      );

      if (!isPasswordValid) {
        return {
          success: false,
          data: null,
          message: "Invalid email or password",
        };
      }

      // 3. Generate JWT token
      const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(JWT_SECRET);

      // 4. Remove password from response
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
      const { payload } = await jwtVerify(token, JWT_SECRET);

      // Get fresh user data
      const user = await prisma.user.findUnique({
        where: { id: payload.userId as string },
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
