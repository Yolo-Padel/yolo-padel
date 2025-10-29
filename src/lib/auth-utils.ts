import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { Role } from "@/types/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
  assignedVenueId?: string;
}

export async function verifyAuth(request: NextRequest): Promise<{
  isValid: boolean;
  user?: AuthUser;
  error?: string;
}> {
  try {
    // Get token from cookies
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return {
        isValid: false,
        error: "Unauthorized - No token provided",
      };
    }

    // Verify token and get user data
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    return {
      isValid: true,
      user: decoded,
    };
  } catch (error) {
    return {
      isValid: false,
      error: "Unauthorized - Invalid token",
    };
  }
}
