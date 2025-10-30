import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { Role } from "@/types/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
  assignedVenueId?: string;
}

type AuthSuccess = { isValid: true; user: AuthUser };
type AuthFailure = { isValid: false; error: string };

export async function verifyAuth(request: NextRequest): Promise<AuthSuccess | AuthFailure> {
  try {
    // Get token from cookies
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return { isValid: false, error: "Unauthorized - No token provided" };
    }

    // Verify token and get user data using jose
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const user = payload as any as AuthUser;
    return { isValid: true, user };
  } catch (error) {
    return { isValid: false, error: "Unauthorized - Invalid token" };
  }
}
