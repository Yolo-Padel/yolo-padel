import { NextRequest, NextResponse } from "next/server";
import { createInvoiceSchema } from "@/lib/validations/xendit.validation";
import {
  xenditService,
  extractInvoicePaymentData,
} from "@/lib/services/xendit.service";
import {
  updatePaymentXenditData,
  getPaymentById,
} from "@/lib/services/payment.service";

/**
 * POST /api/xendit/invoice
 * Create Xendit Invoice
 *
 * For testing: Can be called standalone
 * For production: Use /api/order/[id]/xendit/invoice instead
 *
 * Optional: If paymentId is provided in body, will update payment record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createInvoiceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const result = await xenditService.createInvoice(validation.data);

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 502 }
      );
    }

    // Optional: Update payment record if paymentId is provided
    let updatedPayment = null;
    if (body.paymentId) {
      try {
        const payment = await getPaymentById(body.paymentId);
        if (payment) {
          const xenditData = extractInvoicePaymentData(result.data);
          updatedPayment = await updatePaymentXenditData(
            payment.id,
            xenditData
          );
        }
      } catch (error) {
        console.error("[API] Failed to update payment record:", error);
        // Don't fail the request if payment update fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: {
          xenditInvoice: result.data,
          ...(updatedPayment && { payment: updatedPayment }),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Xendit invoice error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create Xendit invoice",
      },
      { status: 500 }
    );
  }
}
