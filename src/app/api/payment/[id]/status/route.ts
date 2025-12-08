import { NextRequest, NextResponse } from "next/server";
import { getPaymentById } from "@/lib/services/payment.service";
import { verifyAuth } from "@/lib/auth-utils";

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

    const payment = await getPaymentById(paymentId);

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

    // Response includes fee breakdown per Requirements 1.3, 2.3
    // Also includes booking details for payment feedback dialog
    return NextResponse.json({
      success: true,
      data: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        taxAmount: payment.taxAmount,     // Fee breakdown field (Requirements 1.3)
        bookingFee: payment.bookingFee,   // Fee breakdown field (Requirements 2.3)
        paymentDate: payment.paymentDate,
        expiredAt: payment.expiredAt,
        xenditInvoiceId: payment.xenditInvoiceId,
        paymentUrl: payment.paymentUrl,
        // Order info with bookings
        order: payment.order
          ? {
              id: payment.order.id,
              orderCode: payment.order.orderCode,
              status: payment.order.status,
              bookings: payment.order.bookings.map((booking) => ({
                id: booking.id,
                bookingCode: booking.bookingCode,
                bookingDate: booking.bookingDate,
                duration: booking.duration,
                totalPrice: booking.totalPrice,
                court: {
                  name: booking.court.name,
                  venue: {
                    name: booking.court.venue.name,
                  },
                },
                timeSlots: booking.timeSlots.map((slot) => ({
                  openHour: slot.openHour,
                  closeHour: slot.closeHour,
                })),
              })),
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
