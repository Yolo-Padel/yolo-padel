import { NextRequest, NextResponse } from "next/server";
import { magicLinkService } from "@/lib/services/magic-link.service";
import { magicLinkVerifySchema } from "@/lib/validations/magic-link.validation";
import { validateRequest } from "@/lib/validate-request";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequest(request, magicLinkVerifySchema);
    if (!validation.success) {
      return validation.error;
    }

    const { token } = validation.data!;

    // Verify magic link
    const result = await magicLinkService.verifyMagicLink(token);

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

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
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