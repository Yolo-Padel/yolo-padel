import { prisma } from "@/lib/prisma";
import { OrderStatus, BookingStatus, PaymentStatus } from "@/types/prisma";
import { releaseBlockingsByBookingIds } from "./blocking.service";
import { checkOrderCompletion, updateOrderStatus } from "./order.service";

/**
 * Handle payment status change and cascade to order, bookings, and blockings
 * This is typically called from webhook endpoint when payment gateway sends callback
 */
export async function syncPaymentStatusToOrder(
  paymentId: string,
  newPaymentStatus: PaymentStatus
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Get payment with order and bookings
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            bookings: {
              include: {
                blocking: true,
              },
            },
          },
        },
      },
    });

    if (!payment || !payment.order) {
      throw new Error("Payment or Order not found");
    }

    // Update payment status
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: newPaymentStatus,
        ...(newPaymentStatus === PaymentStatus.PAID && {
          paymentDate: new Date(),
        }),
      },
    });

    const bookingIds = payment.order.bookings.map((b) => b.id);

    // Handle different payment statuses
    switch (newPaymentStatus) {
      case PaymentStatus.PAID:
        // Payment SUCCESS
        // Update order status to PAID
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.PAID },
        });

        // Update all bookings to UPCOMING
        await tx.booking.updateMany({
          where: { id: { in: bookingIds } },
          data: { status: BookingStatus.UPCOMING },
        });

        // Blockings remain active (keep slots locked)
        break;

      case PaymentStatus.EXPIRED:
        // Payment TIMEOUT (15 minutes passed)
        // Update order status to EXPIRED
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.EXPIRED },
        });

        // Update all bookings to CANCELLED
        await tx.booking.updateMany({
          where: { id: { in: bookingIds } },
          data: { status: BookingStatus.CANCELLED },
        });

        // Release all blockings (make slots available again)
        await tx.blocking.updateMany({
          where: { bookingId: { in: bookingIds } },
          data: { isBlocking: false },
        });
        break;

      case PaymentStatus.FAILED:
        // Payment FAILED (gateway error)
        // Update order status to FAILED
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: OrderStatus.FAILED },
        });

        // Update all bookings to CANCELLED
        await tx.booking.updateMany({
          where: { id: { in: bookingIds } },
          data: { status: BookingStatus.CANCELLED },
        });

        // Release all blockings
        await tx.blocking.updateMany({
          where: { bookingId: { in: bookingIds } },
          data: { isBlocking: false },
        });
        break;

      default:
        // UNPAID - no action needed
        break;
    }
  });
}

/**
 * Handle booking status change and check if order should be completed
 * This is called when admin marks booking as COMPLETED or NO_SHOW
 */
export async function syncBookingStatusToOrder(
  bookingId: string,
  newBookingStatus: BookingStatus
): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      order: true,
      blocking: true,
    },
  });

  if (!booking || !booking.orderId) {
    // Old booking without order (backward compatibility)
    return;
  }

  // Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: newBookingStatus },
  });

  // Handle specific status changes
  switch (newBookingStatus) {
    case BookingStatus.COMPLETED:
    case BookingStatus.NO_SHOW:
      // Check if all bookings in order are finished
      const allFinished = await checkOrderCompletion(booking.orderId);

      if (allFinished) {
        // Update order to COMPLETED
        await updateOrderStatus(booking.orderId, OrderStatus.COMPLETED);
      }
      break;

    case BookingStatus.CANCELLED:
      // If individual booking is cancelled, release its blocking
      if (booking.blocking) {
        await prisma.blocking.update({
          where: { id: booking.blocking.id },
          data: { isBlocking: false },
        });
      }
      break;

    default:
      // No action for other statuses
      break;
  }
}

/**
 * Handle order status change and cascade to bookings and payment
 * This is called when admin manually changes order status
 */
export async function syncOrderStatusToBookings(
  orderId: string,
  newOrderStatus: OrderStatus
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        bookings: true,
        payment: true,
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: { status: newOrderStatus },
    });

    const bookingIds = order.bookings.map((b) => b.id);

    // Handle different order statuses
    switch (newOrderStatus) {
      case OrderStatus.FAILED:
      case OrderStatus.EXPIRED:
        // Cancel entire order
        // Update all bookings to CANCELLED
        await tx.booking.updateMany({
          where: { id: { in: bookingIds } },
          data: { status: BookingStatus.CANCELLED },
        });

        // Release all blockings
        await tx.blocking.updateMany({
          where: { bookingId: { in: bookingIds } },
          data: { isBlocking: false },
        });

        // Update payment status
        if (order.payment) {
          const newPaymentStatus =
            order.payment.status === PaymentStatus.PAID
              ? PaymentStatus.EXPIRED
              : PaymentStatus.EXPIRED;

          await tx.payment.update({
            where: { id: order.payment.id },
            data: { status: newPaymentStatus },
          });
        }
        break;

      default:
        // No cascading action for other statuses
        break;
    }
  });
}

/**
 * Release all blockings for an order
 * Used when order is cancelled or expired
 */
export async function releaseBlockingsForOrder(orderId: string): Promise<void> {
  const bookings = await prisma.booking.findMany({
    where: { orderId },
    select: { id: true },
  });

  const bookingIds = bookings.map((b) => b.id);
  await releaseBlockingsByBookingIds(bookingIds);
}

