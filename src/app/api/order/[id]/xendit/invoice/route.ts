import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth-utils";
import { getOrderById } from "@/lib/services/order.service";
import { getPaymentByOrderId } from "@/lib/services/payment.service";
import { createXenditInvoiceForOrder } from "@/lib/services/xendit-payment.service";
import { createInvoiceSchema } from "@/lib/validations/xendit.validation";
import { createRequestContext } from "@/types/request-context";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/order/[id]/xendit/invoice
 * Create Xendit Invoice for an existing order
 * This should be called after order is created
 */
export async function POST(
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

    const { id: orderId } = await params;
    const { user } = tokenResult;

    // Get user dengan roleId untuk dynamic RBAC
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.userId },
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
      user.userId,
      user.assignedVenueId
    );

    // Verify order exists and belongs to user
    const order = await getOrderById(orderId, requestContext);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    if (order.userId !== user.userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get payment for this order
    const payment = await getPaymentByOrderId(orderId, requestContext);
    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found for this order" },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Build base URL for redirect URLs
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin ||
      "http://localhost:3000";

    // Prepare invoice params (only include valid fields from body)
    const invoiceParams = {
      externalId: body.externalId || payment.id,
      amount: body.amount || payment.amount,
      payerEmail: body.payerEmail || user.email,
      description: body.description || `Order ${order.orderCode}`,
      invoiceDuration: body.invoiceDuration || 900, // 15 minutes default
      //   paymentMethods: body.paymentMethods || ["QRIS", "OVO", "DANA"],
      successRedirectUrl:
        body.successRedirectUrl ||
        `${baseUrl}/dashboard/booking?paymentStatus=success&orderId=${order.id}&paymentId=${payment.id}`,
      failureRedirectUrl:
        body.failureRedirectUrl ||
        `${baseUrl}/dashboard/booking?paymentStatus=failed&orderId=${order.id}&paymentId=${payment.id}&reason=failed`,
      items: body.items || [
        {
          name: `Order ${order.orderCode}`,
          price: payment.amount,
          quantity: 1,
        },
      ],
      ...(body.customer && { customer: body.customer }),
      ...(body.customerNotificationPreference && {
        customerNotificationPreference: body.customerNotificationPreference,
      }),
      ...(body.callbackVirtualAccountId && {
        callbackVirtualAccountId: body.callbackVirtualAccountId,
      }),
      ...(body.shouldSendEmail !== undefined && {
        shouldSendEmail: body.shouldSendEmail,
      }),
      ...(body.paymentMethods && { paymentMethods: body.paymentMethods }),
      ...(body.midLabel && { midLabel: body.midLabel }),
      ...(body.shouldAuthenticateCreditCard !== undefined && {
        shouldAuthenticateCreditCard: body.shouldAuthenticateCreditCard,
      }),
      ...(body.currency && { currency: body.currency }),
      ...(body.reminderTime && { reminderTime: body.reminderTime }),
      ...(body.reminderTimeUnit && { reminderTimeUnit: body.reminderTimeUnit }),
      ...(body.fees && { fees: body.fees }),
      ...(body.channelProperties && {
        channelProperties: body.channelProperties,
      }),
      metadata: {
        ...(body.metadata || {}),
        orderId: order.id,
        orderCode: order.orderCode,
        paymentId: payment.id,
      },
    };

    // Validate invoice params
    const validation = createInvoiceSchema.safeParse(invoiceParams);

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

    // Create Xendit Invoice (only pass fields that service expects)
    const result = await createXenditInvoiceForOrder(orderId, {
      externalId: validation.data.externalId,
      amount: validation.data.amount,
      payerEmail: validation.data.payerEmail,
      description: validation.data.description,
      invoiceDuration: validation.data.invoiceDuration,
      paymentMethods: validation.data.paymentMethods,
      successRedirectUrl: validation.data.successRedirectUrl,
      failureRedirectUrl: validation.data.failureRedirectUrl,
      items: validation.data.items,
      customer: validation.data.customer,
      metadata: validation.data.metadata,
    });

    if (!result.success || !result.data) {
      console.error("[API] Create Xendit invoice error:", result.message);
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 502 }
      );
    }

    // Get updated payment
    const updatedPayment = await getPaymentByOrderId(orderId, requestContext);

    return NextResponse.json(
      {
        success: true,
        message: "Invoice created successfully",
        data: {
          payment: updatedPayment,
          xenditInvoice: result.data,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Create Xendit invoice error:", error);
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
