import { prisma } from "@/lib/prisma";
import { Payment, PaymentStatus } from "@/types/prisma";
import { syncPaymentStatusToOrder } from "./status-sync.service";
import type { PrismaTransaction } from "@/types/prisma-transaction";
import {
  activityLogService,
  entityReferenceHelpers,
} from "./activity-log.service";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";
import { ServiceContext } from "@/types/service-context";

/**
 * Create payment for an order
 * Payment is created with UNPAID status and 15 minutes expiry
 * Supports both standalone mode (uses prisma) and transaction mode (uses tx parameter)
 *
 * @param data - Payment creation data
 * @param tx - Optional transaction client. If provided, uses transaction; otherwise uses prisma directly
 * @returns Created payment
 *
 * @example
 * // Standalone mode
 * const payment = await createPayment({
 *   orderId: "order-1",
 *   userId: "user-1",
 *   channelName: "QRIS",
 *   amount: 200000
 * });
 *
 * @example
 * // Transaction mode
 * await prisma.$transaction(async (tx) => {
 *   const payment = await createPayment({...}, tx);
 * });
 */
export async function createPayment(
  data: {
    orderId: string;
    userId: string;
    channelName: string;
    amount: number;
    // Fee breakdown fields (optional, default to 0)
    taxAmount?: number;
    bookingFee?: number;
    // Xendit fields (optional)
    xenditInvoiceId?: string | null;
    xenditReferenceId?: string | null;
    paymentUrl?: string | null;
    xenditMetadata?: Record<string, unknown> | null;
    expiredAt?: Date | null;
  },
  tx?: PrismaTransaction
): Promise<Payment> {
  const client = tx || prisma;

  const payment = await client.payment.create({
    data: {
      orderId: data.orderId,
      userId: data.userId,
      channelName: data.channelName,
      amount: data.amount,
      taxAmount: data.taxAmount ?? 0,
      bookingFee: data.bookingFee ?? 0,
      status: PaymentStatus.UNPAID,
      expiredAt: data.expiredAt || new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now or custom
      // Xendit fields (only include if they have values to avoid undefined)
      ...(data.xenditInvoiceId && { xenditInvoiceId: data.xenditInvoiceId }),
      ...(data.xenditReferenceId && {
        xenditReferenceId: data.xenditReferenceId,
      }),
      ...(data.paymentUrl && { paymentUrl: data.paymentUrl }),
      ...(data.xenditMetadata !== undefined && {
        xenditMetadata:
          data.xenditMetadata && typeof data.xenditMetadata === "string"
            ? JSON.parse(data.xenditMetadata)
            : data.xenditMetadata,
      }),
    },
  });

  return payment;
}

/**
 * Get payment by ID
 */
export async function getPaymentById(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: {
          bookings: {
            include: {
              court: {
                select: {
                  name: true,
                  venue: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              timeSlots: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });

  return payment;
}

/**
 * Get payment by order ID
 */
export async function getPaymentByOrderId(orderId: string) {
  const payment = await prisma.payment.findUnique({
    where: { orderId },
  });

  return payment;
}

/**
 * Update payment status
 * This will trigger cascading updates to order, bookings, and blockings
 *
 * @param paymentId - The ID of the payment to update
 * @param newStatus - The new payment status (PAID, EXPIRED, FAILED)
 * @param context - Optional ServiceContext for logging. If null/undefined, indicates system-initiated action (webhook/cron)
 * @returns Updated payment
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 7.2
 */
export async function updatePaymentStatus(
  paymentId: string,
  newStatus: PaymentStatus,
  context?: ServiceContext
): Promise<Payment> {
  // Fetch current status before update for diff (Requirements 2.1, 2.2, 2.3)
  const currentPayment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { status: true },
  });

  const oldStatus = currentPayment?.status;

  // Update payment status in database
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: newStatus,
      ...(newStatus === PaymentStatus.PAID && {
        paymentDate: new Date(),
      }),
    },
  });

  // Trigger cascade updates to order, bookings, and blockings
  await syncPaymentStatusToOrder(paymentId, newStatus);

  // Fetch order code for entity reference
  const order = await prisma.order.findUnique({
    where: { id: payment.orderId },
    select: { orderCode: true },
  });

  // Log payment status update activity
  // Requirements 2.1, 2.2, 2.3: Record UPDATE_PAYMENT action with before/after status
  // Requirements 2.4: Handle null context for system-initiated actions (webhooks/cron)
  activityLogService.record({
    context: context ?? { userRole: "USER", actorUserId: undefined },
    action: ACTION_TYPES.UPDATE_PAYMENT,
    entityType: ENTITY_TYPES.PAYMENT,
    entityId: payment.id,
    entityReference: order
      ? entityReferenceHelpers.order({ orderCode: order.orderCode })
      : undefined,
    changes: {
      before: { status: oldStatus },
      after: { status: newStatus },
    },
  });

  return payment;
}

/**
 * Update Xendit payment data
 * Used after creating payment request/invoice to store Xendit response
 */
export async function updatePaymentXenditData(
  paymentId: string,
  data: {
    xenditInvoiceId?: string | null;
    xenditReferenceId?: string | null;
    paymentUrl?: string | null;
    xenditMetadata?: Record<string, unknown> | null;
  }
): Promise<Payment> {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      ...(data.xenditInvoiceId !== undefined && {
        xenditInvoiceId: data.xenditInvoiceId,
      }),
      ...(data.xenditReferenceId !== undefined && {
        xenditReferenceId: data.xenditReferenceId,
      }),
      ...(data.paymentUrl !== undefined && {
        paymentUrl: data.paymentUrl,
      }),
      ...(data.xenditMetadata !== undefined && {
        xenditMetadata:
          typeof data.xenditMetadata === "string"
            ? JSON.parse(data.xenditMetadata)
            : data.xenditMetadata,
      }),
    },
  });

  return payment;
}

/**
 * Get payment by Xendit Invoice ID
 */
export async function getPaymentByXenditInvoiceId(xenditInvoiceId: string) {
  const payment = await prisma.payment.findFirst({
    where: { xenditInvoiceId },
    include: {
      order: {
        include: {
          bookings: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });

  return payment;
}

/**
 * Handle payment success
 * Called from webhook when payment is confirmed
 */
export async function handlePaymentSuccess(
  paymentId: string
): Promise<Payment> {
  return await updatePaymentStatus(paymentId, PaymentStatus.PAID);
}

/**
 * Handle payment expiry
 * Called from cron job when payment timeout (15 minutes)
 */
export async function handlePaymentExpired(
  paymentId: string
): Promise<Payment> {
  return await updatePaymentStatus(paymentId, PaymentStatus.EXPIRED);
}

/**
 * Handle payment failure
 * Called from webhook when payment gateway returns error
 */
export async function handlePaymentFailed(paymentId: string): Promise<Payment> {
  return await updatePaymentStatus(paymentId, PaymentStatus.FAILED);
}

/**
 * Get expired payments
 * Used by cron job to find payments that need to be expired
 */
export async function getExpiredPendingPayments(): Promise<Payment[]> {
  const now = new Date();

  const expiredPayments = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.UNPAID,
      expiredAt: {
        lte: now,
      },
    },
    include: {
      order: {
        include: {
          bookings: true,
        },
      },
    },
  });

  return expiredPayments;
}

/**
 * Process expired payments (bulk)
 * Used by cron job to expire all pending payments that are past expiry time
 */
export async function processExpiredPayments(): Promise<{
  count: number;
  expiredPaymentIds: string[];
}> {
  const expiredPayments = await getExpiredPendingPayments();
  const expiredPaymentIds: string[] = [];

  for (const payment of expiredPayments) {
    try {
      await handlePaymentExpired(payment.id);
      expiredPaymentIds.push(payment.id);
    } catch (error) {
      console.error(`Failed to expire payment ${payment.id}:`, error);
    }
  }

  return {
    count: expiredPaymentIds.length,
    expiredPaymentIds,
  };
}
