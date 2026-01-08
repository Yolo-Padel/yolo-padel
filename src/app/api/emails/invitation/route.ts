import { NextRequest, NextResponse } from "next/server";
import { brevoService } from "@/lib/services/brevo.service";
import { validateRequest } from "@/lib/validate-request";
import { invitationEmailSchema } from "@/lib/validations/send-email.validation";

export async function POST(request: NextRequest) {
  try {
    const validationResult = await validateRequest(
      request,
      invitationEmailSchema,
    );

    if (!validationResult.success) {
      return validationResult.error!;
    }

    const result = await brevoService.sendInvitationEmail(
      validationResult.data!,
    );

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error("Invitation email API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
