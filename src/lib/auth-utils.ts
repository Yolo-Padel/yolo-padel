import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { UserType } from "@/types/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

export interface AuthUser {
  userId: string;
  email: string;
  userType: UserType;
  assignedVenueIds: string[];
}

type AuthSuccess = { isValid: true; user: AuthUser };
type AuthFailure = { isValid: false; error: string };

export async function verifyAuth(
  request: NextRequest
): Promise<AuthSuccess | AuthFailure> {
  try {
    // Get token from cookies
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return { isValid: false, error: "Unauthorized - No token provided" };
    }

    // Verify token and get user data using jose
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Extract user data from payload
    const userId = (payload as any).userId;
    const email = (payload as any).email;
    const userType = (payload as any).userType;
    const assignedVenueIds = (payload as any).assignedVenueIds || [];

    // Validate required fields
    if (!userId || typeof userId !== "string") {
      console.error("[AUTH] Invalid userId in token payload:", payload);
      return { isValid: false, error: "Invalid token - missing userId" };
    }

    if (!email || typeof email !== "string") {
      console.error("[AUTH] Invalid email in token payload:", payload);
      return { isValid: false, error: "Invalid token - missing email" };
    }

    const user: AuthUser = {
      userId,
      email,
      userType: userType as UserType,
      assignedVenueIds: Array.isArray(assignedVenueIds) ? assignedVenueIds : [],
    };

    return { isValid: true, user };
  } catch (error) {
    return { isValid: false, error: "Unauthorized - Invalid token" };
  }
}
