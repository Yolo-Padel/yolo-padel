import { NextRequest, NextResponse } from "next/server";
import { magicLinkService } from "@/lib/services/magic-link.service";
import { magicLinkExtendSchema } from "@/lib/validations/magic-link.validation";
import { validateRequest } from "@/lib/validate-request";

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequest(request, magicLinkExtendSchema);
    if (!validation.success) {
      return validation.error;
    }

    const { token } = validation.data!;

    // Extend magic link expiry
    const result = await magicLinkService.extendMagicLink(token);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: { token: result.token },
    });
  } catch (error) {
    console.error("Magic link extend error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
