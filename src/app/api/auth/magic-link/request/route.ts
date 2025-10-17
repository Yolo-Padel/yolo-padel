import { NextRequest, NextResponse } from "next/server";
import { magicLinkService } from "@/lib/services/magic-link.service";
import { magicLinkRequestSchema } from "@/lib/validations/magic-link.validation";
import { validateRequest } from "@/lib/validate-request";

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequest(request, magicLinkRequestSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { email } = validation.data!;

    // Generate magic link
    const result = await magicLinkService.generateMagicLink(email);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      // Note: In production, you might want to send this via email instead of returning it
      token: result.token,
    });
  } catch (error) {
    console.error("Magic link request error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}