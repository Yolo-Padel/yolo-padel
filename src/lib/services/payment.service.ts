import { prisma } from "@/lib/prisma";
import { Payment, PaymentStatus } from "@/types/prisma";
import { syncPaymentStatusToOrder } from "./status-sync.service";

/**
 * Create payment for an order
 * Payment is created with PENDING status and 15 minutes expiry
 */
export async function createPayment(data: {
  orderId: string;
  userId: string;
  channelName: string;
  amount: number;
}): Promise<Payment> {
  const payment = await prisma.payment.create({
    data: {
      orderId: data.orderId,
      userId: data.userId,
      channelName: data.channelName,
      amount: data.amount,
      status: PaymentStatus.PENDING,
      expiredAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
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
 */
export async function updatePaymentStatus(
  paymentId: string,
  newStatus: PaymentStatus
): Promise<Payment> {
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

  return payment;
}

/**
 * Handle payment success
 * Called from webhook when payment is confirmed
 */
export async function handlePaymentSuccess(paymentId: string): Promise<Payment> {
  return await updatePaymentStatus(paymentId, PaymentStatus.PAID);
}

/**
 * Handle payment expiry
 * Called from cron job when payment timeout (15 minutes)
 */
export async function handlePaymentExpired(paymentId: string): Promise<Payment> {
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
 * Handle payment refund
 * Called when user cancels order after payment
 */
export async function handlePaymentRefund(paymentId: string): Promise<Payment> {
  return await updatePaymentStatus(paymentId, PaymentStatus.REFUNDED);
}

/**
 * Get expired payments
 * Used by cron job to find payments that need to be expired
 */
export async function getExpiredPendingPayments(): Promise<Payment[]> {
  const now = new Date();

  const expiredPayments = await prisma.payment.findMany({
    where: {
      status: PaymentStatus.PENDING,
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

