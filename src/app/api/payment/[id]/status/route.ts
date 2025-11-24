import { NextRequest, NextResponse } from "next/server";
import { getPaymentById } from "@/lib/services/payment.service";
import { verifyAuth } from "@/lib/auth-utils";
import { createRequestContext } from "@/types/request-context";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/payment/[id]/status
 * Get payment status by payment ID
 * Used for polling payment status in frontend
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tokenResult = await verifyAuth(request);
    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }

    const { id: paymentId } = await params;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Get user dengan roleId untuk dynamic RBAC
    const userWithRole = await prisma.user.findUnique({
      where: { id: tokenResult.user.userId },
      include: { roleRef: true },
    });

    if (!userWithRole?.roleId) {
      return NextResponse.json(
        { success: false, message: "User role not found" },
        { status: 403 }
      );
    }

    const requestContext = createRequestContext(
      userWithRole.roleId,
      tokenResult.user.userId,
      tokenResult.user.assignedVenueId
    );

    const payment = await getPaymentById(paymentId, requestContext);

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // Check if user owns this payment
    if (payment.userId !== tokenResult.user.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        expiredAt: payment.expiredAt,
        xenditInvoiceId: payment.xenditInvoiceId,
        paymentUrl: payment.paymentUrl,
        // Order info
        order: payment.order
          ? {
              id: payment.order.id,
              orderCode: payment.order.orderCode,
              status: payment.order.status,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("[API] Get payment status error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to get payment status",
      },
      { status: 500 }
    );
  }
}
