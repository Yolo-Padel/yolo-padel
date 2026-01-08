import { prisma } from "@/lib/prisma";
import { OrderStatus, BookingStatus, PaymentStatus } from "@/types/prisma";
import { releaseBlockingsByBookingIds } from "./blocking.service";
import { brevoService } from "./brevo.service";
import type {
  BookingCancelationEmailData,
  OrderConfirmationEmailData,
} from "@/lib/validations/send-email.validation";
import { ServiceContext } from "@/types/service-context";
import {
  activityLogService,
  entityReferenceHelpers,
} from "./activity-log.service";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";
import { checkOrderCompletion, updateOrderStatus } from "./order.service";
import { cancelAyoBooking } from "./ayo.service";
import { CancelAyoBookingSchema } from "../validations/ayo.validation";

type EmailJob =
  | { type: "order_confirmation"; payload: OrderConfirmationEmailData }
  | { type: "booking_cancelation"; payload: BookingCancelationEmailData };

const formatTimeRange = (
  timeSlots?: Array<{ openHour: string; closeHour: string }>,
) => {
  if (!timeSlots || timeSlots.length === 0) {
    return "N/A";
  }
  const first = timeSlots[0];
  const last = timeSlots[timeSlots.length - 1];
  return `${first.openHour} - ${last.closeHour}`;
};

const getCustomerName = (user?: {
  email: string | null;
  profile: { fullName: string | null } | null;
}) => {
  return user?.profile?.fullName || user?.email || "Padeler";
};

const getLocationLabel = (court?: {
  name: string | null;
  venue: { name: string | null } | null;
}) => {
  if (!court) {
    return "Yolo Padel";
  }
  const venueName = court.venue?.name;
  if (venueName) {
    return court.name ? `${venueName} • ${court.name}` : venueName;
  }
  return court.name || "Yolo Padel";
};

/**
 * Handle payment status change and cascade to order, bookings, and blockings
 * This is typically called from webhook endpoint when payment gateway sends callback
 */
export async function syncPaymentStatusToOrder(
  paymentId: string,
  newPaymentStatus: PaymentStatus,
): Promise<void> {
  const emailJobs: EmailJob[] = [];

  await prisma.$transaction(async (tx) => {
    // Get payment with order and bookings
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            user: {
              select: {
                email: true,
                profile: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
            bookings: {
              include: {
                blocking: true,
                timeSlots: true,
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

    const customerEmail = payment.order.user?.email || null;
    const customerName = getCustomerName(payment.order.user);

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
        if (customerEmail) {
          emailJobs.push({
            type: "order_confirmation",
            payload: {
              orderCode: payment.order.orderCode,
              email: customerEmail,
              customerName,
              bookings: payment.order.bookings.map((booking) => ({
                court: booking.court?.name || "Padel Court",
                date: booking.bookingDate.toISOString(),
                time: formatTimeRange(
                  booking.timeSlots?.map((slot) => ({
                    openHour: slot.openHour,
                    closeHour: slot.closeHour,
                  })),
                ),
                bookingCode: booking.bookingCode,
                location: getLocationLabel(booking.court),
              })),
            },
          });
        }
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

        const cancelExpiredPaymentPromises: Promise<void>[] = [];

        for (const orderBooking of payment.order.bookings) {
          for (const ayoOrderId of orderBooking.ayoOrderIds) {
            const payload: CancelAyoBookingSchema = {
              order_detail_id: ayoOrderId,
            };

            cancelExpiredPaymentPromises.push(cancelAyoBooking(payload));
          }
        }

        await Promise.all(cancelExpiredPaymentPromises);

        // Release all blockings (make slots available again)
        await tx.blocking.updateMany({
          where: { bookingId: { in: bookingIds } },
          data: { isBlocking: false },
        });

        if (customerEmail) {
          for (const booking of payment.order.bookings) {
            emailJobs.push({
              type: "booking_cancelation",
              payload: {
                orderCode: payment.order.orderCode,
                email: customerEmail,
                customerName,
                court: booking.court?.name || "Padel Court",
                date: booking.bookingDate.toISOString(),
                time: formatTimeRange(
                  booking.timeSlots?.map((slot) => ({
                    openHour: slot.openHour,
                    closeHour: slot.closeHour,
                  })),
                ),
                bookingCode: booking.bookingCode,
                location: getLocationLabel(booking.court),
                status: newPaymentStatus,
              },
            });
          }
        }
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

        const cancelFailedPaymentPromises: Promise<void>[] = [];

        for (const orderBooking of payment.order.bookings) {
          for (const ayoOrderId of orderBooking.ayoOrderIds) {
            const payload: CancelAyoBookingSchema = {
              order_detail_id: ayoOrderId,
            };

            cancelFailedPaymentPromises.push(cancelAyoBooking(payload));
          }
        }

        await Promise.all(cancelFailedPaymentPromises);

        // Release all blockings
        await tx.blocking.updateMany({
          where: { bookingId: { in: bookingIds } },
          data: { isBlocking: false },
        });

        if (customerEmail) {
          for (const booking of payment.order.bookings) {
            emailJobs.push({
              type: "booking_cancelation",
              payload: {
                orderCode: payment.order.orderCode,
                email: customerEmail,
                customerName,
                court: booking.court?.name || "Padel Court",
                date: booking.bookingDate.toISOString(),
                time: formatTimeRange(
                  booking.timeSlots?.map((slot) => ({
                    openHour: slot.openHour,
                    closeHour: slot.closeHour,
                  })),
                ),
                bookingCode: booking.bookingCode,
                location: getLocationLabel(booking.court),
                status: newPaymentStatus,
              },
            });
          }
        }
        break;

      default:
        // UNPAID - no action needed
        break;
    }
  });

  // Send transactional emails outside transaction
  for (const job of emailJobs) {
    try {
      if (job.type === "order_confirmation") {
        await brevoService.sendOrderConfirmationEmail(job.payload);
      } else {
        await brevoService.sendBookingCancelationEmail(job.payload);
      }
    } catch (error) {
      console.error("[EMAIL] Failed to send transactional email:", {
        type: job.type,
        error,
      });
    }
  }
}

/**
 * Handle booking status change and check if order should be completed
 * This is called when admin marks booking as COMPLETED or NO_SHOW
 */
export async function syncBookingStatusToOrder(
  bookingId: string,
  newBookingStatus: BookingStatus,
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
 *
 * @param orderId - The order ID to update
 * @param newOrderStatus - The new status to set
 * @param context - Optional ServiceContext for activity logging (Requirements 7.1)
 */
export async function syncOrderStatusToBookings(
  orderId: string,
  newOrderStatus: OrderStatus,
  context?: ServiceContext,
): Promise<void> {
  // Store old status and orderCode for logging before transaction
  const currentOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, orderCode: true },
  });
  const oldStatus = currentOrder?.status;
  const orderCode = currentOrder?.orderCode;

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

  // Log order status update activity
  // Requirements 1.2: Record UPDATE_ORDER action with before/after status
  activityLogService.record({
    context: context ?? { userRole: "USER", actorUserId: undefined },
    action: ACTION_TYPES.UPDATE_ORDER,
    entityType: ENTITY_TYPES.ORDER,
    entityId: orderId,
    entityReference: orderCode
      ? entityReferenceHelpers.order({ orderCode })
      : undefined,
    changes: {
      before: { status: oldStatus },
      after: { status: newOrderStatus },
    },
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
