import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { Prisma, BookingStatus } from "@prisma/client";
import { UserType } from "@/types/prisma";
import {
  RegisterFormData,
  LoginFormData,
} from "../validations/auth.validation";
import bcrypt from "bcryptjs";
import { NextBookingInfo } from "@/types/profile";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";
const JWT_EXPIRES_IN = "7d";
const secretKey = new TextEncoder().encode(JWT_SECRET);

async function getNextBookingForUser(
  userId: string
): Promise<NextBookingInfo | null> {
  const nextBooking = await prisma.booking.findFirst({
    where: {
      userId,
      status: {
        in: [BookingStatus.UPCOMING],
      },
      bookingDate: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
    orderBy: [{ bookingDate: "asc" }, { createdAt: "asc" }],
    include: {
      timeSlots: true,
      court: {
        select: {
          id: true,
          name: true,
          venue: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!nextBooking) return null;

  return {
    bookingId: nextBooking.id,
    bookingCode: nextBooking.bookingCode,
    bookingDate: nextBooking.bookingDate.toISOString(),
    status: nextBooking.status,
    courtId: nextBooking.court.id,
    courtName: nextBooking.court.name,
    venueId: nextBooking.court.venue.id,
    venueName: nextBooking.court.venue.name,
    timeSlots: nextBooking.timeSlots ?? [],
  };
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
      const hashedPassword = await bcrypt.hash(
        process.env.DUMMY_PASSWORD || "",
        12
      );

      // 3. Create user and profile in transaction
      const result = await prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          // Create user
          const user = await tx.user.create({
            data: {
              email: data.email,
              password: hashedPassword,
              userType: data.userType || UserType.USER,
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
        userType: result.user.userType,
        assignedVenueIds: result.user.assignedVenueIds,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(secretKey);

      const { password, ...userWithoutPassword } = result.user;

      const nextBooking = await getNextBookingForUser(result.user.id);

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          profile: result.profile,
          nextBooking,
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
      const isPasswordValid = await bcrypt.compare(
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
      // 3. Generate JWT token (jose)
      const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        userType: user.userType,
        assignedVenueIds: user.assignedVenueIds,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(secretKey);

      const { password, ...userWithoutPassword } = user;
      const nextBooking = await getNextBookingForUser(user.id);

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          profile: user.profile,
          nextBooking,
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
        include: { profile: true, membership: true },
      });

      if (!user) {
        return { success: false, data: null };
      }

      const { password, ...userWithoutPassword } = user;
      const nextBooking = await getNextBookingForUser(user.id);

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          profile: user.profile,
          nextBooking,
          membership: user.membership,
        },
      };
    } catch (error) {
      return { success: false, data: null };
    }
  },
};
