import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus } from "@/types/prisma";
import { updatePaymentStatus } from "@/lib/services/payment.service";

/**
 * POST /api/webhook/payment
 * Webhook endpoint for payment gateway callbacks
 * This is called by payment gateway (e.g. Xendit, Midtrans) when payment status changes
 */
export async function POST(request: NextRequest) {
  try {
    // ════════════════════════════════════════════════════════
    // 1. VERIFY WEBHOOK SIGNATURE (Security!)
    // ════════════════════════════════════════════════════════
    const signature = request.headers.get("x-callback-token");
    const expectedSignature = process.env.PAYMENT_WEBHOOK_TOKEN;

    if (!expectedSignature) {
      console.error("[WEBHOOK] Payment webhook token not configured");
      return NextResponse.json(
        { success: false, message: "Webhook not configured" },
        { status: 500 }
      );
    }

    if (signature !== expectedSignature) {
      console.error("[WEBHOOK] Invalid signature");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ════════════════════════════════════════════════════════
    // 2. PARSE WEBHOOK DATA
    // ════════════════════════════════════════════════════════
    const body = await request.json();

    const {
      event, // e.g. "payment.paid", "payment.expired"
      external_id, // Payment ID from our system
      status, // e.g. "PAID", "EXPIRED", "FAILED"
      paid_amount,
      paid_at,
    } = body;

    console.log("[WEBHOOK] Received payment callback:", {
      event,
      external_id,
      status,
      paid_amount,
    });

    // ════════════════════════════════════════════════════════
    // 3. VALIDATE PAYMENT ID
    // ════════════════════════════════════════════════════════
    if (!external_id) {
      console.error("[WEBHOOK] Missing external_id (payment ID)");
      return NextResponse.json(
        { success: false, message: "Missing payment ID" },
        { status: 400 }
      );
    }

    // ════════════════════════════════════════════════════════
    // 4. MAP PAYMENT GATEWAY STATUS TO OUR STATUS
    // ════════════════════════════════════════════════════════
    let newPaymentStatus: PaymentStatus;

    // Map based on event or status
    if (event === "payment.paid" || status === "PAID") {
      newPaymentStatus = PaymentStatus.PAID;
    } else if (event === "payment.expired" || status === "EXPIRED") {
      newPaymentStatus = PaymentStatus.EXPIRED;
    } else if (event === "payment.failed" || status === "FAILED") {
      newPaymentStatus = PaymentStatus.FAILED;
    } else {
      console.log("[WEBHOOK] Unknown payment status, ignoring:", { event, status });
      // Return 200 OK to prevent retries from payment gateway
      return NextResponse.json({ success: true, message: "Status ignored" });
    }

    // ════════════════════════════════════════════════════════
    // 5. UPDATE PAYMENT STATUS (with cascading updates)
    // ════════════════════════════════════════════════════════
    try {
      await updatePaymentStatus(external_id, newPaymentStatus);

      console.log("[WEBHOOK] Payment status updated successfully:", {
        paymentId: external_id,
        newStatus: newPaymentStatus,
      });
    } catch (error) {
      console.error("[WEBHOOK] Failed to update payment status:", error);

      // Check if payment not found
      if (error instanceof Error && error.message.includes("not found")) {
        return NextResponse.json(
          { success: false, message: "Payment not found" },
          { status: 404 }
        );
      }

      // For other errors, still return 200 to prevent retry storm
      // But log the error for investigation
      console.error("[WEBHOOK] Error but returning 200 to prevent retries");
      return NextResponse.json(
        {
          success: false,
          message: "Error processing webhook",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 200 }
      );
    }

    // ════════════════════════════════════════════════════════
    // 6. RETURN 200 OK (Important!)
    // ════════════════════════════════════════════════════════
    // Payment gateway expects 200 OK response
    // If not 200, they will retry webhook multiple times
    return NextResponse.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("[WEBHOOK] Unexpected error:", error);

    // Still return 200 to prevent retry storm
    return NextResponse.json(
      {
        success: false,
        message: "Internal error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}

/**
 * GET /api/webhook/payment
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Payment webhook endpoint is active",
  });
}

