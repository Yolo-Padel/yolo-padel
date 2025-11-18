import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus } from "@/types/prisma";
import {
  updatePaymentStatus,
  getPaymentByXenditInvoiceId,
  getPaymentById,
} from "@/lib/services/payment.service";
import { parseWebhookPayload } from "@/lib/webhook/xendit-webhook-parser";
import { mapWebhookStatus } from "@/lib/webhook/xendit-webhook-status-mapper";

/**
 * POST /api/webhook/payment
 * Webhook endpoint for Xendit payment callbacks (Invoice only)
 *
 * Xendit webhook format:
 * - Header: X-CALLBACK-TOKEN (for verification)
 * - Body: Invoice payload (id, external_id, status, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    // ════════════════════════════════════════════════════════
    // 1. VERIFY WEBHOOK SIGNATURE
    // ════════════════════════════════════════════════════════
    const signature =
      request.headers.get("x-callback-token") ||
      request.headers.get("X-CALLBACK-TOKEN");
    const expectedSignature =
      process.env.XENDIT_WEBHOOK_TOKEN || process.env.PAYMENT_WEBHOOK_TOKEN;

    if (!expectedSignature) {
      console.error("[WEBHOOK] Webhook token not configured");
      return NextResponse.json(
        { success: false, message: "Webhook not configured" },
        { status: 500 }
      );
    }

    if (signature !== expectedSignature) {
      console.error("[WEBHOOK] Invalid webhook signature");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // ════════════════════════════════════════════════════════
    // 2. PARSE WEBHOOK PAYLOAD
    // ════════════════════════════════════════════════════════
    const body = await request.json();

    console.log("XENDIT WEBHOOK PAYLOAD ", body);

    console.log("[WEBHOOK] Received Xendit callback:", {
      hasEvent: !!body.event,
      hasData: !!body.data,
      hasId: !!body.id,
      hasExternalId: !!body.external_id,
    });

    const parsedData = parseWebhookPayload(body);

    if (!parsedData) {
      console.error("[WEBHOOK] Unable to parse webhook payload:", body);
      return NextResponse.json(
        { success: false, message: "Invalid webhook payload format" },
        { status: 400 }
      );
    }

    // ════════════════════════════════════════════════════════
    // 3. FIND PAYMENT BY XENDIT ID (Invoice only)
    // ════════════════════════════════════════════════════════
    let payment = null;

    if (parsedData.xenditId) {
      payment = await getPaymentByXenditInvoiceId(parsedData.xenditId);
    }
    if (!payment && parsedData.paymentId) {
      payment = await getPaymentById(parsedData.paymentId);
    }

    if (!payment) {
      console.warn(
        "[WEBHOOK] Payment not found:",
        parsedData.type,
        parsedData.xenditId
      );
      // Return 200 to prevent retries (payment might not exist)
      return NextResponse.json({
        success: true,
        message: "Payment not found, ignoring",
      });
    }

    // ════════════════════════════════════════════════════════
    // 4. MAP STATUS TO INTERNAL PAYMENT STATUS
    // ════════════════════════════════════════════════════════
    const newPaymentStatus = mapWebhookStatus(parsedData);

    if (!newPaymentStatus) {
      console.log(
        "[WEBHOOK] Status ignored (not actionable):",
        parsedData.status,
        parsedData.event
      );
      return NextResponse.json({
        success: true,
        message: "Status ignored",
      });
    }

    // ════════════════════════════════════════════════════════
    // 5. UPDATE PAYMENT STATUS
    // ════════════════════════════════════════════════════════
    try {
      await updatePaymentStatus(payment.id, newPaymentStatus);

      console.log("[WEBHOOK] Payment status updated:", {
        paymentId: payment.id,
        orderId: payment.orderId,
        oldStatus: payment.status,
        newStatus: newPaymentStatus,
        webhookType: parsedData.type,
        xenditId: parsedData.xenditId,
      });

      // TODO: Broadcast to SSE clients (will be added in SSE implementation)
      // paymentSSEManager.broadcast(payment.id, { ... });
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
    // 6. RETURN 200 OK
    // ════════════════════════════════════════════════════════
    // Xendit expects 200 OK response
    // If not 200, they will retry webhook up to 6 times
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
