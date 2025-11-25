import { NextRequest, NextResponse } from "next/server";
import { magicLinkService } from "@/lib/services/magic-link.service";
import { magicLinkVerifySchema } from "@/lib/validations/magic-link.validation";
import { validateRequest } from "@/lib/validate-request";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequest(request, magicLinkVerifySchema);
    if (!validation.success) {
      return validation.error;
    }

    const { token } = validation.data!;

    console.log("[MAGIC LINK VERIFY] Token received:", token);

    // Verify magic link
    const result = await magicLinkService.verifyMagicLink(token);

    console.log("[MAGIC LINK VERIFY] Verification result:", result);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { email: result.email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Generate JWT token using jose
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-super-secret-key"
    );
    const jwtToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      userType: user.userType,
      assignedVenueIds: user.assignedVenueIds,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        userStatus: user.userStatus,
        joinDate: user.joinDate,
        profile: user.profile,
      },
    });

    response.cookies.set("auth-token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Magic link verify error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
