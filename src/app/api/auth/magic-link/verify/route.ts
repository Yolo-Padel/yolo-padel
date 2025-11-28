import { NextRequest, NextResponse } from "next/server";
import { magicLinkService } from "@/lib/services/magic-link.service";
import { magicLinkVerifySchema } from "@/lib/validations/magic-link.validation";
import { validateRequest } from "@/lib/validate-request";
import { prisma } from "@/lib/prisma";
import { SignJWT } from "jose";
import { bookingService } from "@/lib/services/booking.service";

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
        membership: true,
        roles: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const venues = await prisma.venue.findMany({
      where: { id: { in: user.assignedVenueIds } },
    });

    const { password, ...userWithoutPassword } = user;
    const nextBooking = await bookingService.getNextBookingForUser(user.id);

    // Generate JWT token using jose
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "your-super-secret-key"
    );
    const jwtToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      userType: user.userType,
      assignedVenueIds: user.assignedVenueIds,
      roles: user.roles,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        profile: userWithoutPassword.profile,
        nextBooking,
        membership: userWithoutPassword.membership,
        venues,
        roles: userWithoutPassword.roles,
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
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
