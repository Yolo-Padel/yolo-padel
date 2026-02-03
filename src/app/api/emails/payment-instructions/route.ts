import { NextRequest, NextResponse } from "next/server";
import { brevoService } from "@/lib/services/brevo.service";
import { paymentInstructionsEmailSchema } from "@/lib/validations/send-email.validation";

/**
 * POST /api/emails/payment-instructions
 * Test endpoint for sending payment instructions email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Parse expiresAt if it's a string
    if (body.expiresAt && typeof body.expiresAt === "string") {
      body.expiresAt = new Date(body.expiresAt);
    }

    const validationResult = paymentInstructionsEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const result = await brevoService.sendPaymentInstructionsEmail(
      validationResult.data
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Send payment instructions email error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send email",
      },
      { status: 500 }
    );
  }
}
