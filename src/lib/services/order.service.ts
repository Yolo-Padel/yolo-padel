import { prisma } from "@/lib/prisma";
import { Order, OrderStatus, BookingStatus } from "@/types/prisma";
import { customAlphabet } from "nanoid";

/**
 * Generate unique order code
 * Format: #ORD{5-alphanumeric}
 * Example: #ORDABC12, #ORD9X7K2
 */
export function generateOrderCode(): string {
  const nanoId = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 5);
  return `ORD-${nanoId()}`;
}

/**
 * Create order with multiple bookings
 */
export async function createOrder(data: {
  userId: string;
  bookings: Array<{
    courtId: string;
    date: Date;
    slots: string[]; // Format: ["07:00-08:00", "08:00-09:00"]
    price: number;
  }>;
  channelName: string;
}): Promise<
  Order & {
    bookings: Array<{
      id: string;
      courtId: string;
      bookingCode: string;
      blocking: { id: string } | null;
    }>;
    payment: { id: string; status: string } | null;
  }
> {
  const { userId, bookings: bookingData, channelName } = data;

  // Generate order code
  const orderCode = generateOrderCode();

  // Calculate total amount
  const totalAmount = bookingData.reduce(
    (sum, booking) => sum + booking.price * booking.slots.length,
    0
  );

  // Create order with bookings, payment, and blockings in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // 1. Create Order
    const newOrder = await tx.order.create({
      data: {
        userId,
        orderCode,
        totalAmount,
        status: OrderStatus.PENDING,
      },
    });

    // 2. Create Bookings
    const createdBookings = [];
    for (const bookingItem of bookingData) {
      // Generate booking code
      const bookingNanoId = customAlphabet(
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        5
      );
      const bookingCode = `BK-${bookingNanoId()}`;

      // Parse slots to get time slot data
      const timeSlots = bookingItem.slots.map((slot) => {
        const [openHour, closeHour] = slot.split("-");
        return { openHour, closeHour };
      });

      // Create booking
      const booking = await tx.booking.create({
        data: {
          courtId: bookingItem.courtId,
          userId,
          orderId: newOrder.id,
          source: "YOLO",
          bookingDate: bookingItem.date,
          bookingCode,
          duration: bookingItem.slots.length,
          totalPrice: bookingItem.price * bookingItem.slots.length,
          status: BookingStatus.PENDING,
          timeSlots: {
            create: timeSlots,
          },
        },
        include: {
          timeSlots: true,
        },
      });

      // Create blocking for this booking
      const blocking = await tx.blocking.create({
        data: {
          bookingId: booking.id,
          description: `Blocked for order ${orderCode}`,
          isBlocking: true,
        },
      });

      createdBookings.push({
        id: booking.id,
        courtId: booking.courtId,
        bookingCode: booking.bookingCode,
        blocking: { id: blocking.id },
      });
    }

    // 3. Create Payment
    const payment = await tx.payment.create({
      data: {
        orderId: newOrder.id,
        userId,
        channelName,
        amount: totalAmount,
        status: "PENDING",
        expiredAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      },
    });

    // Return order with relations
    return {
      ...newOrder,
      bookings: createdBookings,
      payment: {
        id: payment.id,
        status: payment.status,
      },
    };
  });

  return order;
}

/**
 * Get order by ID with full details
 */
export async function getOrderById(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              avatar: true,
            },
          },
        },
      },
      bookings: {
        include: {
          court: {
            select: {
              id: true,
              name: true,
              price: true,
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          timeSlots: {
            select: {
              openHour: true,
              closeHour: true,
            },
          },
          blocking: {
            select: {
              id: true,
              isBlocking: true,
            },
          },
        },
      },
      payment: {
        select: {
          id: true,
          channelName: true,
          amount: true,
          status: true,
          paymentDate: true,
          expiredAt: true,
        },
      },
    },
  });

  return order;
}

/**
 * Get orders by user ID with pagination
 */
export async function getOrdersByUserId(
  userId: string,
  options?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
  }
) {
  const { page = 1, limit = 10, status } = options || {};
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(status && { status }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        bookings: {
          include: {
            court: {
              select: {
                id: true,
                name: true,
                venue: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: true,
                  },
                },
              },
            },
            timeSlots: {
              select: {
                openHour: true,
                closeHour: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
            paymentDate: true,
            channelName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data: orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update order status
 * This will also trigger cascading status updates to related entities
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<Order> {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  return order;
}

/**
 * Cancel order
 * This will cancel all bookings, release blockings, and update payment status
 */
export async function cancelOrder(orderId: string): Promise<Order> {
  const order = await prisma.$transaction(async (tx) => {
    // Get order with bookings
    const orderData = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        bookings: true,
        payment: true,
      },
    });

    if (!orderData) {
      throw new Error("Order not found");
    }

    // Update order status
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });

    // Update all bookings status
    await tx.booking.updateMany({
      where: { orderId },
      data: { status: BookingStatus.CANCELLED },
    });

    // Release all blockings
    const bookingIds = orderData.bookings.map((b) => b.id);
    await tx.blocking.updateMany({
      where: {
        bookingId: { in: bookingIds },
      },
      data: { isBlocking: false },
    });

    // Update payment status
    if (orderData.payment) {
      const newPaymentStatus =
        orderData.payment.status === "PAID" ? "REFUNDED" : "EXPIRED";
      await tx.payment.update({
        where: { id: orderData.payment.id },
        data: { status: newPaymentStatus },
      });
    }

    return updatedOrder;
  });

  return order;
}

/**
 * Check if all bookings in an order are completed
 */
export async function checkOrderCompletion(orderId: string): Promise<boolean> {
  const bookings = await prisma.booking.findMany({
    where: { orderId },
    select: { status: true },
  });

  // Order is completed if all bookings are COMPLETED or NO_SHOW
  const allFinished = bookings.every(
    (b) =>
      b.status === BookingStatus.COMPLETED || b.status === BookingStatus.NO_SHOW
  );

  return allFinished;
}
