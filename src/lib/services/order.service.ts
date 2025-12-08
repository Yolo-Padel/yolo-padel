import { prisma } from "@/lib/prisma";
import {
  Order,
  OrderStatus,
  BookingStatus,
  PaymentStatus,
  UserType,
} from "@/types/prisma";
import { customAlphabet } from "nanoid";
import { createBooking } from "./booking.service";
import { createPayment } from "./payment.service";
import { createBlocking } from "./blocking.service";
import { Prisma } from "@prisma/client";

/**
 * Options for filtering orders in admin dashboard
 */
export interface GetOrdersForAdminOptions {
  // User context for authorization
  userType: UserType;
  assignedVenueIds: string[];

  // Filter options
  search?: string;
  venueId?: string;
  paymentStatus?: PaymentStatus;

  // Pagination options
  page?: number;
  limit?: number;
}

/**
 * Pagination metadata for order results
 */
export interface OrderPaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Result type for getOrdersForAdmin function
 */
export interface GetOrdersForAdminResult {
  data: Array<
    Order & {
      user: {
        id: string;
        email: string;
        profile: {
          fullName: string | null;
          avatar: string | null;
        } | null;
      };
      bookings: Array<{
        id: string;
        courtId: string;
        bookingDate: Date;
        duration: number;
        totalPrice: number;
        court: {
          id: string;
          name: string;
          price: number;
          image: string | null;
          venue: {
            id: string;
            name: string;
            slug: string;
            images: string[];
          };
        };
        timeSlots: Array<{
          openHour: string;
          closeHour: string;
        }>;
      }>;
      payment: {
        id: string;
        channelName: string;
        amount: number;
        taxAmount: number;    // Fee breakdown field (Requirements 1.3, 2.3)
        bookingFee: number;   // Fee breakdown field (Requirements 1.3, 2.3)
        status: PaymentStatus;
        paymentDate: Date | null;
        paymentUrl: string | null;
      } | null;
    }
  >;
  pagination: OrderPaginationMetadata;
}

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
 *
 * This is an orchestration function that coordinates the creation of:
 * - Order entry
 * - Multiple booking entries (with time slots)
 * - Blockings for each booking
 * - Payment entry
 *
 * All operations are performed in a single transaction (all-or-nothing).
 *
 * @param data - Order creation data
 * @returns Created order with bookings and payment relations
 *
 * @example
 * const order = await createOrder({
 *   userId: "user-1",
 *   bookings: [
 *     {
 *       courtId: "court-1",
 *       date: new Date("2024-11-07"),
 *       slots: ["10:00-11:00", "11:00-12:00"],
 *       price: 100000
 *     }
 *   ],
 *   channelName: "QRIS"
 * });
 */
/**
 * Parse date string (YYYY-MM-DD) to Date object in local timezone
 * Preserves exact date without timezone conversion
 */
function parseDateToLocal(date: string | Date): Date {
  if (date instanceof Date) {
    return date;
  }
  // If string YYYY-MM-DD, parse as local date
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.log("THIS WAS RUNNINGG");
    const [year, month, day] = date.split("-").map(Number);

    console.log("YEAR", year);
    console.log("MONTH", month);
    console.log("DAY", day);
    console.log("NEW DATE", new Date(year, month - 1, day));
    return new Date(year, month - 1, day, 7, 0, 0, 0);
  }
  // Otherwise parse as-is
  return new Date(date);
}

export async function createOrder(data: {
  userId: string;
  bookings: Array<{
    courtId: string;
    date: string | Date; // Accept string (YYYY-MM-DD) or Date
    slots: string[]; // Format: ["07:00-08:00", "08:00-09:00"]
    price: number;
  }>;
  channelName: string;
  // Fee breakdown fields (optional, default to 0)
  taxAmount?: number;
  bookingFee?: number;
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
  const { userId, bookings: bookingData, channelName, taxAmount = 0, bookingFee = 0 } = data;

  // Generate order code (orchestration responsibility)
  const orderCode = generateOrderCode();

  // Calculate base amount from bookings (court rental cost)
  const baseAmount = bookingData.reduce(
    (sum, booking) => sum + booking.price * booking.slots.length,
    0
  );

  // Calculate total amount including fees: baseAmount + taxAmount + bookingFee
  // Requirements 3.1: totalAmount = base booking amount + taxAmount + bookingFee
  const totalAmount = baseAmount + taxAmount + bookingFee;

  // All operations in a single transaction (all-or-nothing)
  const order = await prisma.$transaction(async (tx) => {
    // 1. Get venue IDs from courts before creating order
    const courts = await tx.court.findMany({
      where: {
        id: {
          in: bookingData.map((b) => b.courtId),
        },
      },
      select: {
        venueId: true,
      },
    });

    const uniqueVenueIds = [...new Set(courts.map((c) => c.venueId))];

    // 2. Create Order entry with venue IDs
    const newOrder = await tx.order.create({
      data: {
        userId,
        orderCode,
        totalAmount,
        status: OrderStatus.PENDING,
        venueIds: uniqueVenueIds,
      },
    });

    // 2. Create Bookings (using extracted service)
    const createdBookings = await Promise.all(
      bookingData.map(async (bookingItem) => {
        // Generate booking code (orchestration responsibility)
        const bookingNanoId = customAlphabet(
          "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          5
        );
        const bookingCode = `BK-${bookingNanoId()}`;

        // Parse slots to get time slot data (orchestration responsibility)
        const timeSlots = bookingItem.slots.map((slot) => {
          const [openHour, closeHour] = slot.split("-");
          return { openHour, closeHour };
        });

        console.log("BOOKING ITEM DATE", bookingItem.date);

        // Parse date to local timezone (preserves exact date selected by user)
        const bookingDate = parseDateToLocal(bookingItem.date);

        console.log("BOOKING DATE ON SERVICE", bookingDate);

        // Create booking using extracted service
        const booking = await createBooking(
          {
            courtId: bookingItem.courtId,
            userId,
            orderId: newOrder.id,
            bookingDate,
            bookingCode,
            duration: bookingItem.slots.length,
            totalPrice: bookingItem.price * bookingItem.slots.length,
            timeSlots,
            source: "YOLO",
            status: BookingStatus.PENDING,
          },
          tx // Pass transaction client
        );

        // Create blocking for this booking (using extracted service)
        const blocking = await createBlocking(
          booking.id,
          `Blocked for order ${orderCode}`,
          tx // Pass transaction client
        );

        return {
          id: booking.id,
          courtId: booking.courtId,
          bookingCode: booking.bookingCode,
          blocking: { id: blocking.id },
        };
      })
    );

    // 3. Create Payment (using extracted service)
    // Pass fee breakdown to payment for financial tracking
    // Note: Payment.amount stores the base booking amount (court rental only)
    // taxAmount and bookingFee are stored separately for reporting
    const payment = await createPayment(
      {
        orderId: newOrder.id,
        userId,
        channelName,
        amount: baseAmount, // Base booking amount (court rental cost)
        taxAmount, // Tax portion
        bookingFee, // Service/platform fee
      },
      tx // Pass transaction client
    );

    // 4. Assign user to venues from order (for end users)
    // Get current user to check existing assigned venues
    const currentUser = await tx.user.findUnique({
      where: { id: userId },
      select: { assignedVenueIds: true, userType: true },
    });

    // Only assign venues to end users (USER type), not ADMIN or STAFF
    if (currentUser && currentUser.userType === "USER") {
      // Merge with existing assigned venues (avoid duplicates)
      const updatedVenueIds = [
        ...new Set([...currentUser.assignedVenueIds, ...uniqueVenueIds]),
      ];

      // Update user's assigned venues
      await tx.user.update({
        where: { id: userId },
        data: {
          assignedVenueIds: updatedVenueIds,
        },
      });
    }

    // Return order with relations (backward compatibility)
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
          taxAmount: true,    // Fee breakdown field (Requirements 1.3, 2.3)
          bookingFee: true,   // Fee breakdown field (Requirements 1.3, 2.3)
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
            taxAmount: true,    // Fee breakdown field (Requirements 1.3, 2.3)
            bookingFee: true,   // Fee breakdown field (Requirements 1.3, 2.3)
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
 * Get all orders for admin dashboard (no pagination/filter)
 */
export async function getAllOrdersForAdmin() {
  const orders = await prisma.order.findMany({
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
              image: true,
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
          channelName: true,
          amount: true,
          taxAmount: true,    // Fee breakdown field (Requirements 1.3, 2.3)
          bookingFee: true,   // Fee breakdown field (Requirements 1.3, 2.3)
          status: true,
          paymentDate: true,
          paymentUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
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
      data: { status: OrderStatus.FAILED },
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
      await tx.payment.update({
        where: { id: orderData.payment.id },
        data: { status: PaymentStatus.EXPIRED },
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

/**
 * Build venue filter based on user type and assigned venues
 * Uses the Order.venueIds field for efficient filtering
 *
 * @param userType - The type of user (ADMIN or STAFF)
 * @param assignedVenueIds - Array of venue IDs assigned to STAFF users
 * @param venueId - Optional specific venue filter
 * @returns Prisma where clause for venue filtering
 */
function buildVenueFilter(
  userType: UserType,
  assignedVenueIds: string[],
  venueId?: string
): Prisma.OrderWhereInput["venueIds"] {
  // ADMIN users have unrestricted access
  if (userType === "ADMIN") {
    // If a specific venue is requested, filter by that venue
    if (venueId) {
      return {
        has: venueId,
      };
    }
    // Otherwise, no venue restriction
    return undefined;
  }

  // STAFF users are restricted to their assigned venues
  if (userType === "STAFF") {
    // If STAFF has no assigned venues, return a filter that matches nothing
    if (assignedVenueIds.length === 0) {
      return {
        isEmpty: true, // This will match no orders since all orders have venueIds
      };
    }

    // If a specific venue is requested, ensure it's in the assigned list
    if (venueId) {
      // Only allow filtering by assigned venues
      if (assignedVenueIds.includes(venueId)) {
        return {
          has: venueId,
        };
      } else {
        // Requested venue is not assigned, return no results
        return {
          isEmpty: true, // This will match no orders
        };
      }
    }

    // No specific venue requested, filter by all assigned venues
    // Order must have at least one venue ID that overlaps with assigned venues
    return {
      hasSome: assignedVenueIds,
    };
  }

  // For other user types (USER), return no results
  return {
    isEmpty: true, // This will match no orders
  };
}

/**
 * Sanitize search input to prevent SQL injection
 * Prisma handles parameterization, but we still trim and validate
 *
 * @param search - Raw search string from user input
 * @returns Sanitized search string or undefined if empty
 */
function sanitizeSearchInput(search?: string): string | undefined {
  if (!search) return undefined;

  // Trim whitespace
  const trimmed = search.trim();

  // Return undefined if empty after trimming
  if (trimmed.length === 0) return undefined;

  // Prisma handles SQL injection prevention through parameterized queries
  // We just need to ensure the string is valid
  return trimmed;
}

/**
 * Build search filter for order code, customer name, and email
 *
 * @param search - Search query string
 * @returns Prisma OR clause for searching multiple fields
 */
function buildSearchFilter(search?: string): Prisma.OrderWhereInput["OR"] {
  const sanitizedSearch = sanitizeSearchInput(search);

  if (!sanitizedSearch) {
    return undefined;
  }

  // Build OR clause to search across multiple fields (case-insensitive)
  return [
    {
      orderCode: {
        contains: sanitizedSearch,
        mode: "insensitive",
      },
    },
    {
      user: {
        profile: {
          fullName: {
            contains: sanitizedSearch,
            mode: "insensitive",
          },
        },
      },
    },
    {
      user: {
        email: {
          contains: sanitizedSearch,
          mode: "insensitive",
        },
      },
    },
  ];
}

/**
 * Build payment status filter
 *
 * @param paymentStatus - Payment status to filter by
 * @returns Prisma where clause for payment status filtering
 */
function buildPaymentStatusFilter(
  paymentStatus?: PaymentStatus
): Prisma.OrderWhereInput["payment"] {
  // If no payment status specified, return undefined (no filter)
  if (!paymentStatus) {
    return undefined;
  }

  // Filter by the specified payment status
  return {
    status: paymentStatus,
  };
}

/**
 * Build pagination parameters and calculate metadata
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @param total - Total number of items
 * @returns Pagination parameters and metadata
 */
function buildPaginationParams(
  page?: number,
  limit?: number,
  total?: number
): {
  skip: number;
  take: number;
  metadata: (total: number) => OrderPaginationMetadata;
} {
  // Default values
  const validPage = Math.max(1, page || 1);
  const validLimit = Math.max(1, Math.min(100, limit || 10)); // Cap at 100

  // Calculate skip for Prisma query
  const skip = (validPage - 1) * validLimit;

  // Return skip, take, and a function to build metadata
  return {
    skip,
    take: validLimit,
    metadata: (total: number) => ({
      page: validPage,
      limit: validLimit,
      total,
      totalPages: Math.ceil(total / validLimit),
    }),
  };
}

/**
 * Build complete Prisma where clause combining all filters
 *
 * @param options - Filter options from GetOrdersForAdminOptions
 * @returns Complete Prisma where clause
 */
function buildWhereClause(
  options: GetOrdersForAdminOptions
): Prisma.OrderWhereInput {
  const { userType, assignedVenueIds, search, venueId, paymentStatus } =
    options;

  // Build individual filter components
  const searchFilter = buildSearchFilter(search);
  const venueFilter = buildVenueFilter(userType, assignedVenueIds, venueId);
  const paymentFilter = buildPaymentStatusFilter(paymentStatus);

  // Combine all filters with AND logic
  const where: Prisma.OrderWhereInput = {
    // Search filter (OR clause for multiple fields)
    OR: searchFilter,

    // Venue filter (uses Order.venueIds field for efficient filtering)
    venueIds: venueFilter,

    // Payment status filter
    payment: paymentFilter,
  };

  return where;
}

/**
 * Get orders for admin dashboard with server-side filtering and pagination
 *
 * This function implements comprehensive filtering based on:
 * - User authorization (ADMIN vs STAFF with venue restrictions)
 * - Search query (order code, customer name, email)
 * - Payment status
 * - Venue
 * - Pagination
 *
 * All filters are applied at the database level for optimal performance.
 *
 * @param options - Filter and pagination options
 * @returns Filtered orders with pagination metadata
 *
 * @example
 * // ADMIN user searching for orders
 * const result = await getOrdersForAdmin({
 *   userType: "ADMIN",
 *   assignedVenueIds: [],
 *   search: "ORD-123",
 *   page: 1,
 *   limit: 10
 * });
 *
 * @example
 * // STAFF user viewing orders from assigned venues
 * const result = await getOrdersForAdmin({
 *   userType: "STAFF",
 *   assignedVenueIds: ["venue-1", "venue-2"],
 *   paymentStatus: "PAID",
 *   page: 1,
 *   limit: 10
 * });
 */
export async function getOrdersForAdmin(
  options: GetOrdersForAdminOptions
): Promise<GetOrdersForAdminResult> {
  // Build where clause combining all filters
  const where = buildWhereClause(options);

  // Build pagination parameters
  const { skip, take, metadata } = buildPaginationParams(
    options.page,
    options.limit
  );

  // Execute query with filters and pagination
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
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
                image: true,
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
            channelName: true,
            amount: true,
            taxAmount: true,    // Fee breakdown field (Requirements 1.3, 2.3)
            bookingFee: true,   // Fee breakdown field (Requirements 1.3, 2.3)
            status: true,
            paymentDate: true,
            paymentUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    }),
    prisma.order.count({ where }),
  ]);

  // Return data with pagination metadata
  return {
    data: orders,
    pagination: metadata(total),
  };
}
