import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/lib/validate-request";
import { authService } from "@/lib/services/auth.service";
import { bypassVerifyTokenSchema } from "@/lib/validations/auth.validation";
import { SignJWT } from "jose";

export async function POST(request: NextRequest) {
  try {
    const validation = await validateRequest(request, bypassVerifyTokenSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { userEmail } = validation.data!;
    const result = await authService.bypassAuth(userEmail);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message, data: null },
        { status: 400 }
      );
    }

    // Generate JWT token using jose
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-super-secret-key"
    );
    const jwtToken = await new SignJWT({
      userId: result.data?.user.id,
      email: result.data?.user.email,
      userType: result.data?.user.userType,
      assignedVenueIds: result.data?.user.assignedVenueIds,
      roles: result.data?.user.roles,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: result.data?.user,
        profile: result.data?.profile,
        nextBooking: result.data?.nextBooking,
        membership: result.data?.membership,
        venues: result.data?.venues,
        roles: result.data?.roles,
      },
    });
    // Set cookie
    response.cookies.set("auth-token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Bypass verify token error:", error);
    return NextResponse.json(
      { success: false, message: "Internsal server error" },
      { status: 500 }
    );
  }
}
