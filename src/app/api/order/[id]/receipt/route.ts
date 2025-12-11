import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/services/order.service";
import { verifyAuth } from "@/lib/auth-utils";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ReceiptPDF } from "@/components/receipt/receipt-pdf";
import { Order } from "@/hooks/use-order";

/**
 * GET /api/order/[id]/receipt
 * Generate and download receipt PDF for an order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tokenResult = await verifyAuth(request);

    if (!tokenResult.isValid) {
      return NextResponse.json(
        { success: false, message: tokenResult.error },
        { status: 401 }
      );
    }

    const { user } = tokenResult;

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get order
    const orderData = await getOrderById(id);

    if (!orderData) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Check if user owns this order
    if (orderData.userId !== user.userId) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    // Transform order data to match Order type
    const order: Order = {
      id: orderData.id,
      orderCode: orderData.orderCode,
      totalAmount: orderData.totalAmount,
      status: orderData.status,
      createdAt: orderData.createdAt.toISOString(),
      updatedAt: orderData.updatedAt.toISOString(),
      user: orderData.user
        ? ({
            id: orderData.user.id,
            email: orderData.user.email,
            profile: orderData.user.profile
              ? {
                  fullName: orderData.user.profile.fullName || "",
                  avatar: orderData.user.profile.avatar,
                }
              : null,
          } as Order["user"])
        : undefined,
      bookings: orderData.bookings.map((booking) => ({
        id: booking.id,
        bookingCode: booking.bookingCode,
        courtId: booking.courtId,
        bookingDate: booking.bookingDate.toISOString(),
        duration: booking.duration,
        totalPrice: booking.totalPrice,
        status: booking.status,
        court: {
          id: booking.court.id,
          name: booking.court.name,
          image: null,
          venue: {
            id: booking.court.venue.id,
            name: booking.court.venue.name,
            slug: booking.court.venue.slug,
            images: [],
          },
        },
        timeSlots: booking.timeSlots.map((slot) => ({
          openHour: slot.openHour,
          closeHour: slot.closeHour,
        })),
      })),
      payment: orderData.payment
        ? {
            id: orderData.payment.id,
            channelName: orderData.payment.channelName,
            amount: orderData.payment.amount,
            taxAmount: orderData.payment.taxAmount ?? 0,     // Fee breakdown field (Requirements 1.3)
            bookingFee: orderData.payment.bookingFee ?? 0,   // Fee breakdown field (Requirements 2.3)
            status: orderData.payment.status,
            paymentDate: orderData.payment.paymentDate
              ? orderData.payment.paymentDate.toISOString()
              : null,
            paymentUrl: "",
          }
        : null,
    };

    // Generate PDF
    const pdfElement = React.createElement(ReceiptPDF, { order });
    const pdfBuffer = await renderToBuffer(pdfElement as any);

    // Return PDF as response
    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${order.orderCode}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[API] Generate receipt error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to generate receipt",
      },
      { status: 500 }
    );
  }
}
