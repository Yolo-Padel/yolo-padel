import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { brevoService } from "@/lib/services/brevo.service";
import { paymentInstructionsEmailSchema } from "@/lib/validations/send-email.validation";

/** Rate limit: 10 requests per minute per user */
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;

/**
 * POST /api/emails/payment-instructions
 * Test endpoint for sending payment instructions email.
 * Protected: requires auth; rate-limited per user.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        { success: false, message: authResult.error },
        { status: 401 },
      );
    }

    const allowed = checkRateLimit(authResult.user.userId, {
      windowMs: RATE_LIMIT_WINDOW_MS,
      maxRequests: RATE_LIMIT_MAX,
    });
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please try again later.",
        },
        { status: 429 },
      );
    }

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
        { status: 400 },
      );
    }

    const result = await brevoService.sendPaymentInstructionsEmail(
      validationResult.data,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Send payment instructions email error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send email",
      },
      { status: 500 },
    );
  }
}
