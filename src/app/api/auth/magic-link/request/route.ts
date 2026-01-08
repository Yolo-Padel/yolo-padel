import { NextRequest, NextResponse } from "next/server";
import { magicLinkService } from "@/lib/services/magic-link.service";
import { magicLinkRequestSchema } from "@/lib/validations/magic-link.validation";
import { validateRequest } from "@/lib/validate-request";
import { brevoService } from "@/lib/services/brevo.service";

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
        { status: 400 },
      );
    }

    const magicLinkUrl =
      process.env.NEXT_PUBLIC_APP_URL + "/auth/verify?token=" + result.token!;

    // send email with magic link token and redirect to verification page
    const emailResponse = await brevoService.sendMagicLinkEmail(
      { email: email },
      magicLinkUrl,
    );

    if (!emailResponse.success) {
      return NextResponse.json(emailResponse, { status: 500 });
    }

    return NextResponse.json(emailResponse, { status: 200 });
  } catch (error) {
    console.error("Magic link request error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
