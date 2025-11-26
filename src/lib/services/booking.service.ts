// src/lib/services/booking.service.ts
import { prisma } from "@/lib/prisma";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";
import {
  BookingStatus,
  Booking,
  UserType,
  PaymentStatus,
} from "@/types/prisma";
import { activityLogService } from "@/lib/services/activity-log.service";
import { requirePermission, ServiceContext } from "@/types/service-context";
import { BookingCreateData } from "../validations/booking.validation";
import { customAlphabet } from "nanoid";
import type { PrismaTransaction } from "@/types/prisma-transaction";
import type {
  AdminDashboardSnapshot,
  BookingDashboardMetrics,
  BookingSummaryStats,
  SuperAdminDashboardSnapshot,
  TodaysBookingCollection,
} from "@/types/booking-dashboard";
import { Prisma } from "@prisma/client";
import { NextBookingInfo } from "@/types/profile";

/**
 * Parse date string (YYYY-MM-DD) and return Date object representing start of day in local timezone
 * Preserves the exact date selected by user without timezone conversion
 * @param dateString Date string in YYYY-MM-DD format or Date object
 * @returns Date object representing start of day in local timezone
 */
function parseDateString(dateString: string | Date): Date {
  // If already Date object, use it directly
  if (dateString instanceof Date) {
    return dateString;
  }

  // If it's already in ISO format with time, parse directly
  if (dateString.includes("T")) {
    return new Date(dateString);
  }

  // If it's YYYY-MM-DD format, parse as local date (not UTC)
  // This preserves the exact date selected by user
  // Example: "2024-11-09" -> 2024-11-09T00:00:00 in local timezone
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const BOOKING_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.UPCOMING,
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
  BookingStatus.NO_SHOW,
];

type BookingStatusGroup = {
  status: BookingStatus;
  _count: { _all: number };
};

function getStatusCountMap(
  groups: BookingStatusGroup[]
): Record<BookingStatus, number> {
  return BOOKING_STATUSES.reduce(
    (acc, status) => {
      acc[status] =
        groups.find((item) => item.status === status)?._count._all ?? 0;
      return acc;
    },
    {} as Record<BookingStatus, number>
  );
}

function buildSummaryFromCounts(
  counts: Record<BookingStatus, number>,
  expiredPayment: number
): BookingSummaryStats {
  const total =
    counts[BookingStatus.PENDING] +
    counts[BookingStatus.UPCOMING] +
    counts[BookingStatus.COMPLETED] +
    counts[BookingStatus.CANCELLED] +
    counts[BookingStatus.NO_SHOW];

  return {
    total,
    completed: counts[BookingStatus.COMPLETED],
    pending: counts[BookingStatus.PENDING],
    upcoming: counts[BookingStatus.UPCOMING],
    cancelled: counts[BookingStatus.CANCELLED] + counts[BookingStatus.NO_SHOW],
    expiredPayment,
  };
}

function buildMetrics(
  counts: Record<BookingStatus, number>,
  expiredPayment: number,
  revenueAmount: number,
  revenueTransactions: number,
  courtUtilization?: { utilizedCourts: number; totalActiveCourts: number }
): { metrics: BookingDashboardMetrics; summary: BookingSummaryStats } {
  const summary = buildSummaryFromCounts(counts, expiredPayment);
  const paidRate =
    summary.total === 0
      ? 0
      : parseFloat(((revenueTransactions / summary.total) * 100).toFixed(2));
  const cancellationTotal = summary.cancelled + summary.expiredPayment;

  const metrics: BookingDashboardMetrics = {
    totalRevenue: {
      amount: revenueAmount,
      transactionCount: revenueTransactions,
    },
    totalBookings: {
      total: summary.total,
      completed: summary.completed,
      upcoming: summary.upcoming,
      pending: summary.pending,
      cancelled: summary.cancelled,
    },
    paidRate: {
      percentage: paidRate,
      paidCount: revenueTransactions,
      totalCount: summary.total,
    },
    cancellation: {
      total: cancellationTotal,
      cancelled: summary.cancelled,
      expiredPayment: summary.expiredPayment,
    },
  };

  if (courtUtilization) {
    const { utilizedCourts, totalActiveCourts } = courtUtilization;
    const utilizationPercentage =
      totalActiveCourts === 0
        ? 0
        : Math.min(
            100,
            parseFloat(((utilizedCourts / totalActiveCourts) * 100).toFixed(2))
          );
    metrics.courtUtilization = {
      percentage: utilizationPercentage,
      utilizedCourts,
      totalActiveCourts,
    };
  }

  return { metrics, summary };
}

function getUtcDayRange(date: Date) {
  const start = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
  const end = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );
  return { start, end };
}

function getUtcRangeForPastDays(days: number) {
  const today = getUtcDayRange(new Date());
  const start = new Date(today.start);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { start, end: today.end };
}

export const bookingService = {
  // Get all bookings with related data
  getAll: async () => {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          timeSlots: true,
          court: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true,
                },
              },
            },
          },
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatar: true,
                },
              },
            },
          },
          order: {
            select: {
              id: true,
              orderCode: true,
              status: true,
              totalAmount: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true,
              channelName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        success: true,
        data: bookings,
        message: "Get all bookings successful",
      };
    } catch (error) {
      console.error("Get all bookings error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Get all bookings failed",
      };
    }
  },

  // Get bookings by user
  getByUser: async (userId: string) => {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          userId,
        },
        include: {
          timeSlots: true,
          court: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true,
                  images: true,
                },
              },
            },
          },
          order: {
            include: {
              payment: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        success: true,
        data: bookings,
        message: "Get user bookings successful",
      };
    } catch (error) {
      console.error("Get user bookings error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Get user bookings failed",
      };
    }
  },

  // Get bookings by court
  getByCourt: async (courtId: string) => {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          courtId,
        },
        include: {
          timeSlots: true,
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatar: true,
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true,
              channelName: true,
            },
          },
        },
        orderBy: {
          bookingDate: "asc",
        },
      });

      return {
        success: true,
        data: bookings,
        message: "Get court bookings successful",
      };
    } catch (error) {
      console.error("Get court bookings error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Get court bookings failed",
      };
    }
  },

  // Get bookings by venue and date
  getByVenueAndDate: async (venueId: string, date: Date) => {
    try {
      // Normalize date to UTC start/end of day
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();

      const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

      const bookings = await prisma.booking.findMany({
        where: {
          court: {
            venueId,
          },
          bookingDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            not: BookingStatus.CANCELLED,
          },
        },
        include: {
          timeSlots: true,
          court: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatar: true,
                },
              },
            },
          },
          blocking: true,
          order: {
            select: {
              id: true,
              orderCode: true,
              status: true,
              totalAmount: true,
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true,
              channelName: true,
            },
          },
        },
        orderBy: {
          bookingDate: "asc",
        },
      });

      return {
        success: true,
        data: bookings,
        message: "Get venue bookings successful",
      };
    } catch (error) {
      console.error("Get venue bookings error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Get venue bookings failed",
      };
    }
  },

  getSuperAdminDashboardSnapshot: async () => {
    try {
      const [statusGroups, paidAggregate, expiredPaymentCount] =
        await Promise.all([
          prisma.booking.groupBy({
            by: ["status"],
            _count: { _all: true },
          }),
          prisma.payment.aggregate({
            where: { status: PaymentStatus.PAID },
            _sum: { amount: true },
            _count: { _all: true },
          }),
          prisma.payment.count({
            where: { status: PaymentStatus.EXPIRED },
          }),
        ]);

      const statusCounts = getStatusCountMap(statusGroups);
      const revenueAmount = paidAggregate._sum?.amount ?? 0;
      const revenueTransactions = paidAggregate._count?._all ?? 0;

      const { metrics, summary } = buildMetrics(
        statusCounts,
        expiredPaymentCount,
        revenueAmount,
        revenueTransactions
      );

      const payload: SuperAdminDashboardSnapshot = {
        metrics,
        bookingSummary: summary,
      };

      return {
        success: true,
        data: payload,
        message: "Super admin dashboard snapshot fetched",
      };
    } catch (error) {
      console.error("Get super admin dashboard snapshot error:", error);
      return {
        success: false,
        data: null,
        message: "Failed to fetch super admin dashboard snapshot",
      };
    }
  },

  getAdminDashboardSnapshot: async (
    context: ServiceContext
  ): Promise<{
    success: boolean;
    data: AdminDashboardSnapshot | null;
    message: string;
  }> => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      // Build venue filter based on user type
      let venueWhere: any = {};
      let courtVenueWhere: any = {};

      if (context.userRole === UserType.STAFF) {
        // STAFF: only assigned venues
        const assignedVenueIds = Array.isArray(context.assignedVenueId)
          ? context.assignedVenueId.filter(Boolean)
          : context.assignedVenueId
            ? [context.assignedVenueId]
            : [];

        if (assignedVenueIds.length === 0) {
          return {
            success: false,
            data: null,
            message: "Assigned venue is required for admin dashboard",
          };
        }

        venueWhere = { venueId: { in: assignedVenueIds } };
        courtVenueWhere = { court: { venueId: { in: assignedVenueIds } } };
      }
      // ADMIN: all venues (no filter)

      const todayRange = getUtcDayRange(new Date());
      const utilizationRange = getUtcRangeForPastDays(7);

      const [
        statusGroups,
        paidAggregate,
        expiredPaymentCount,
        todaysBookingsRaw,
        totalActiveCourts,
        utilizedCourtGroups,
      ] = await Promise.all([
        prisma.booking.groupBy({
          by: ["status"],
          _count: { _all: true },
          where: {
            ...courtVenueWhere,
          },
        }),
        prisma.payment.aggregate({
          where: {
            status: PaymentStatus.PAID,
            order: {
              bookings: {
                some: {
                  ...courtVenueWhere,
                },
              },
            },
          },
          _sum: { amount: true },
          _count: { _all: true },
        }),
        prisma.payment.count({
          where: {
            status: PaymentStatus.EXPIRED,
            order: {
              bookings: {
                some: {
                  ...courtVenueWhere,
                },
              },
            },
          },
        }),
        prisma.booking.findMany({
          where: {
            ...courtVenueWhere,
            bookingDate: {
              gte: todayRange.start,
              lte: todayRange.end,
            },
            status: {
              in: [
                BookingStatus.PENDING,
                BookingStatus.UPCOMING,
                BookingStatus.COMPLETED,
              ],
            },
          },
          select: {
            id: true,
            bookingCode: true,
            bookingDate: true,
            totalPrice: true,
            duration: true,
            status: true,
            timeSlots: {
              select: {
                openHour: true,
                closeHour: true,
              },
              orderBy: {
                openHour: "asc",
              },
            },
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
            court: {
              select: {
                name: true,
              },
            },
          },
          orderBy: [{ bookingDate: "asc" }, { createdAt: "asc" }],
          take: 20,
        }),
        prisma.court.count({
          where: {
            ...venueWhere,
            isActive: true,
            isArchived: false,
          },
        }),
        prisma.booking.groupBy({
          by: ["courtId"],
          where: {
            ...courtVenueWhere,
            bookingDate: {
              gte: utilizationRange.start,
              lte: utilizationRange.end,
            },
            status: {
              in: [
                BookingStatus.PENDING,
                BookingStatus.UPCOMING,
                BookingStatus.COMPLETED,
              ],
            },
          },
        }),
      ]);

      const statusCounts = getStatusCountMap(statusGroups);
      const revenueAmount = paidAggregate._sum?.amount ?? 0;
      const revenueTransactions = paidAggregate._count?._all ?? 0;
      const utilizedCourts = utilizedCourtGroups.length;

      const todaysBookings: TodaysBookingCollection = {
        total: todaysBookingsRaw.length,
        items: todaysBookingsRaw.map((booking) => ({
          id: booking.id,
          bookingCode: booking.bookingCode,
          bookingDate: booking.bookingDate,
          totalPrice: booking.totalPrice,
          duration: booking.duration,
          status: booking.status,
          timeSlots: booking.timeSlots.map((slot) => ({
            openHour: slot.openHour,
            closeHour: slot.closeHour,
          })),
          customerName: booking.user.profile?.fullName || booking.user.email,
          courtName: booking.court.name,
        })),
      };

      const { metrics } = buildMetrics(
        statusCounts,
        expiredPaymentCount,
        revenueAmount,
        revenueTransactions,
        {
          utilizedCourts,
          totalActiveCourts,
        }
      );

      const payload: AdminDashboardSnapshot = {
        metrics,
        todaysBookings,
      };

      return {
        success: true,
        data: payload,
        message: "Admin dashboard snapshot fetched",
      };
    } catch (error) {
      console.error("Get admin dashboard snapshot error:", error);
      return {
        success: false,
        data: null,
        message: "Failed to fetch admin dashboard snapshot",
      };
    }
  },

  // Get bookings by status
  getByStatus: async (status: BookingStatus) => {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          status,
        },
        include: {
          timeSlots: true,
          court: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true,
                  images: true,
                },
              },
            },
          },
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatar: true,
                },
              },
            },
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true,
              channelName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        success: true,
        data: bookings,
        message: `Get ${status.toLowerCase()} bookings successful`,
      };
    } catch (error) {
      console.error(`Get ${status.toLowerCase()} bookings error:`, error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : `Get ${status.toLowerCase()} bookings failed`,
      };
    }
  },

  // Get booking by ID
  getById: async (id: string) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: {
          id,
        },
        include: {
          timeSlots: true,
          court: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true,
                  address: true,
                  phone: true,
                  images: true,
                },
              },
            },
          },
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatar: true,
                },
              },
            },
          },
          order: {
            select: {
              id: true,
              orderCode: true,
              status: true,
              totalAmount: true,
            },
          },
          payments: true,
          blocking: true,
        },
      });

      if (!booking) {
        return {
          success: false,
          data: null,
          message: "Booking not found",
        };
      }

      return {
        success: true,
        data: booking,
        message: "Get booking successful",
      };
    } catch (error) {
      console.error("Get booking error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Get booking failed",
      };
    }
  },

  // Create booking (deprecated)
  create: async (booking: BookingCreateData, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.USER);
      if (accessError) return accessError;

      const nanoId = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 5);

      const currentDate = new Date();
      const bookingCode = `BK-${nanoId()}`;

      // Parse booking date - handle both ISO format and YYYY-MM-DD format
      // This ensures timezone issues are resolved
      const parsedBookingDate = parseDateString(booking.bookingDate);

      // Create booking with time slots
      const newBooking = await prisma.booking.create({
        data: {
          courtId: booking.courtId,
          userId: context.actorUserId || "",
          orderId: booking.orderId || null, // Optional - for order flow
          source: "YOLO system",
          bookingDate: parsedBookingDate,
          bookingHour: booking.bookingHour || null, // Backward compatibility
          bookingCode: bookingCode,
          duration: booking.duration,
          totalPrice: booking.totalPrice,
          status: BookingStatus.PENDING,
          courtsideCourtId: null,
          // Create time slots
          timeSlots: {
            create: booking.timeSlots.map((slot) => ({
              openHour: slot.openHour,
              closeHour: slot.closeHour,
            })),
          },
        },
        include: {
          timeSlots: true,
          court: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true,
                },
              },
            },
          },
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      // audit log
      activityLogService.record({
        context,
        action: ACTION_TYPES.CREATE_BOOKING,
        entityType: ENTITY_TYPES.BOOKING,
        entityId: newBooking.id,
        changes: { before: {}, after: newBooking } as any,
      });

      return {
        success: true,
        data: newBooking,
        message: "Create booking successful",
      };
    } catch (error) {
      console.error("Create booking error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Create booking failed",
      };
    }
  },

  // Check slot availability
  checkAvailability: async (
    courtId: string,
    date: Date,
    timeSlots: Array<{ openHour: string; closeHour: string }>
  ) => {
    try {
      // Normalize date to UTC start/end of day for consistent comparison
      // This ensures timezone issues don't affect availability checks
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();

      const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

      // Find conflicting bookings
      const conflictingBookings = await prisma.booking.findMany({
        where: {
          courtId,
          bookingDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          status: {
            not: BookingStatus.CANCELLED,
          },
          timeSlots: {
            some: {
              OR: timeSlots.map((slot) => ({
                OR: [
                  // Overlap scenarios: slot overlaps with existing booking
                  {
                    AND: [
                      { openHour: { lte: slot.openHour } },
                      { closeHour: { gt: slot.openHour } },
                    ],
                  },
                  {
                    AND: [
                      { openHour: { lt: slot.closeHour } },
                      { closeHour: { gte: slot.closeHour } },
                    ],
                  },
                  {
                    AND: [
                      { openHour: { gte: slot.openHour } },
                      { closeHour: { lte: slot.closeHour } },
                    ],
                  },
                ],
              })),
            },
          },
        },
        include: { timeSlots: true },
      });

      // Extract all booked slots
      const bookedSlots = conflictingBookings.flatMap((booking) =>
        booking.timeSlots.map((ts) => ({
          openHour: ts.openHour,
          closeHour: ts.closeHour,
        }))
      );

      // Check which requested slots are available
      const availableSlots = timeSlots.filter((requestedSlot) => {
        return !bookedSlots.some((bookedSlot) => {
          // Check if slots overlap
          return (
            (requestedSlot.openHour < bookedSlot.closeHour &&
              requestedSlot.closeHour > bookedSlot.openHour) ||
            (requestedSlot.openHour === bookedSlot.openHour &&
              requestedSlot.closeHour === bookedSlot.closeHour)
          );
        });
      });

      return {
        success: true,
        data: {
          available: conflictingBookings.length === 0,
          conflictingSlots: bookedSlots,
          availableSlots,
        },
        message:
          conflictingBookings.length === 0
            ? "All slots are available"
            : "Some slots are already booked",
      };
    } catch (error) {
      console.error("Check availability error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Check availability failed",
      };
    }
  },
  getNextBookingForUser: async (
    userId: string
  ): Promise<NextBookingInfo | null> => {
    const nextBooking = await prisma.booking.findFirst({
      where: {
        userId,
        status: {
          in: [BookingStatus.UPCOMING],
        },
        bookingDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      orderBy: [{ bookingDate: "asc" }, { createdAt: "asc" }],
      include: {
        timeSlots: true,
        court: {
          select: {
            id: true,
            name: true,
            venue: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!nextBooking) return null;

    return {
      bookingId: nextBooking.id,
      bookingCode: nextBooking.bookingCode,
      bookingDate: nextBooking.bookingDate.toISOString(),
      status: nextBooking.status,
      courtId: nextBooking.court.id,
      courtName: nextBooking.court.name,
      venueId: nextBooking.court.venue.id,
      venueName: nextBooking.court.venue.name,
      timeSlots: nextBooking.timeSlots ?? [],
    };
  },
};

/**
 * Options for filtering bookings in admin dashboard
 */
export interface GetBookingsForAdminOptions {
  // User context for authorization
  userType: UserType;
  assignedVenueIds: string[];

  // Filter options
  search?: string;
  venueId?: string;
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;

  // Pagination options
  page?: number;
  limit?: number;
}

/**
 * Pagination metadata for booking results
 */
export interface BookingPaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Result type for getBookingsForAdmin function
 */
export interface GetBookingsForAdminResult {
  data: Array<
    Booking & {
      timeSlots: Array<{
        id: string;
        openHour: string;
        closeHour: string;
      }>;
      user: {
        id: string;
        email: string;
        profile: {
          fullName: string | null;
          avatar: string | null;
        } | null;
      };
      court: {
        id: string;
        name: string;
        venue: {
          id: string;
          name: string;
          city: string | null;
        };
      };
      order: {
        id: string;
        orderCode: string;
        status: string;
        totalAmount: number;
      } | null;
      payments: Array<{
        id: string;
        amount: number;
        status: PaymentStatus;
        paymentDate: Date | null;
        channelName: string | null;
      }>;
    }
  >;
  pagination: BookingPaginationMetadata;
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
 * Build search filter for booking code, customer name, email, court name, and venue name
 *
 * @param search - Search query string
 * @returns Prisma OR clause for searching multiple fields
 */
function buildSearchFilter(search?: string): Prisma.BookingWhereInput["OR"] {
  const sanitizedSearch = sanitizeSearchInput(search);

  if (!sanitizedSearch) {
    return undefined;
  }

  // Build OR clause to search across multiple fields (case-insensitive)
  return [
    {
      bookingCode: {
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
    {
      court: {
        name: {
          contains: sanitizedSearch,
          mode: "insensitive",
        },
      },
    },
    {
      court: {
        venue: {
          name: {
            contains: sanitizedSearch,
            mode: "insensitive",
          },
        },
      },
    },
  ];
}

/**
 * Build venue filter based on user type and assigned venues
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
): { venueId: string } | { venueId: { in: string[] } } | undefined {
  // ADMIN users have unrestricted access
  if (userType === "ADMIN") {
    // If a specific venue is requested, filter by that venue
    if (venueId) {
      return {
        venueId: venueId,
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
        venueId: {
          in: [], // Empty array will match no venues
        },
      };
    }

    // If a specific venue is requested, ensure it's in the assigned list
    if (venueId) {
      // Only allow filtering by assigned venues
      if (assignedVenueIds.includes(venueId)) {
        return {
          venueId: venueId,
        };
      } else {
        // Requested venue is not assigned, return no results
        return {
          venueId: {
            in: [], // Empty array will match no venues
          },
        };
      }
    }

    // No specific venue requested, filter by all assigned venues
    return {
      venueId: {
        in: assignedVenueIds,
      },
    };
  }

  // For other user types (USER), return no results
  return {
    venueId: {
      in: [], // Empty array will match no venues
    },
  };
}

/**
 * Build status filter
 *
 * @param status - Booking status to filter by
 * @returns Prisma where clause for status filtering
 */
function buildStatusFilter(
  status?: BookingStatus
): Prisma.BookingWhereInput["status"] {
  // If no status specified, return undefined (no filter)
  if (!status) {
    return undefined;
  }

  // Filter by the specified status
  return status;
}

/**
 * Build date range filter
 *
 * @param startDate - Start date for filtering
 * @param endDate - End date for filtering
 * @returns Prisma where clause for date range filtering
 */
function buildDateRangeFilter(
  startDate?: Date,
  endDate?: Date
): Prisma.BookingWhereInput["bookingDate"] {
  // If neither date is specified, return undefined (no filter)
  if (!startDate && !endDate) {
    return undefined;
  }

  // Build date range filter
  const dateFilter: Prisma.DateTimeFilter = {};

  if (startDate) {
    dateFilter.gte = startDate;
  }

  if (endDate) {
    dateFilter.lte = endDate;
  }

  return dateFilter;
}

/**
 * Build pagination parameters and calculate metadata
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns Pagination parameters and metadata
 */
function buildPaginationParams(
  page?: number,
  limit?: number
): {
  skip: number;
  take: number;
  metadata: (total: number) => BookingPaginationMetadata;
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
 * @param options - Filter options from GetBookingsForAdminOptions
 * @returns Complete Prisma where clause
 */
function buildWhereClause(
  options: GetBookingsForAdminOptions
): Prisma.BookingWhereInput {
  const {
    userType,
    assignedVenueIds,
    search,
    venueId,
    status,
    startDate,
    endDate,
  } = options;

  // Build individual filter components
  const searchFilter = buildSearchFilter(search);
  const venueFilter = buildVenueFilter(userType, assignedVenueIds, venueId);
  const statusFilter = buildStatusFilter(status);
  const dateRangeFilter = buildDateRangeFilter(startDate, endDate);

  // Debug logging
  console.log("[Booking Service] buildWhereClause - Input options:", {
    userType,
    venueId,
    assignedVenueIds,
    search,
    status,
  });
  console.log(
    "[Booking Service] buildWhereClause - Venue filter:",
    venueFilter
  );

  // Combine all filters with AND logic
  const where: Prisma.BookingWhereInput = {
    // Search filter (OR clause for multiple fields)
    OR: searchFilter,

    // Venue filter (handles both ADMIN and STAFF authorization)
    court: venueFilter,

    // Status filter
    status: statusFilter,

    // Date range filter
    bookingDate: dateRangeFilter,
  };

  console.log(
    "[Booking Service] buildWhereClause - Final where clause:",
    JSON.stringify(where, null, 2)
  );

  return where;
}

/**
 * Get bookings for admin dashboard with server-side filtering and pagination
 *
 * This function implements comprehensive filtering based on:
 * - User authorization (ADMIN vs STAFF with venue restrictions)
 * - Search query (booking code, customer name, email, court name, venue name)
 * - Booking status
 * - Venue
 * - Date range
 * - Pagination
 *
 * All filters are applied at the database level for optimal performance.
 *
 * @param options - Filter and pagination options
 * @returns Filtered bookings with pagination metadata
 *
 * @example
 * // ADMIN user searching for bookings
 * const result = await getBookingsForAdmin({
 *   userType: "ADMIN",
 *   assignedVenueIds: [],
 *   search: "BK-123",
 *   page: 1,
 *   limit: 10
 * });
 *
 * @example
 * // STAFF user viewing bookings from assigned venues
 * const result = await getBookingsForAdmin({
 *   userType: "STAFF",
 *   assignedVenueIds: ["venue-1", "venue-2"],
 *   status: "UPCOMING",
 *   page: 1,
 *   limit: 10
 * });
 */
export async function getBookingsForAdmin(
  options: GetBookingsForAdminOptions
): Promise<GetBookingsForAdminResult> {
  // Build where clause combining all filters
  const where = buildWhereClause(options);

  // Build pagination parameters
  const { skip, take, metadata } = buildPaginationParams(
    options.page,
    options.limit
  );

  // Execute query with filters and pagination
  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        timeSlots: {
          select: {
            id: true,
            openHour: true,
            closeHour: true,
          },
        },
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
        court: {
          select: {
            id: true,
            name: true,
            venue: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
        },
        order: {
          select: {
            id: true,
            orderCode: true,
            status: true,
            totalAmount: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentDate: true,
            channelName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take,
    }),
    prisma.booking.count({ where }),
  ]);

  // Return data with pagination metadata
  return {
    data: bookings,
    pagination: metadata(total),
  };
}

/**
 * Create a booking with time slots
 * Supports both standalone mode (uses prisma) and transaction mode (uses tx parameter)
 *
 * @param data - Booking creation data
 * @param tx - Optional transaction client. If provided, uses transaction; otherwise uses prisma directly
 * @returns Created booking with time slots
 *
 * @example
 * // Standalone mode
 * const booking = await createBooking({
 *   courtId: "court-1",
 *   userId: "user-1",
 *   orderId: "order-1",
 *   bookingDate: new Date(),
 *   bookingCode: "BK-ABC12",
 *   duration: 2,
 *   totalPrice: 200000,
 *   timeSlots: [{ openHour: "10:00", closeHour: "12:00" }]
 * });
 *
 * @example
 * // Transaction mode
 * await prisma.$transaction(async (tx) => {
 *   const booking = await createBooking({...}, tx);
 * });
 */
export async function createBooking(
  data: {
    courtId: string;
    userId: string;
    orderId: string | null;
    bookingDate: Date;
    bookingCode: string;
    duration: number;
    totalPrice: number;
    timeSlots: Array<{ openHour: string; closeHour: string }>;
    source?: string;
    status?: BookingStatus;
  },
  tx?: PrismaTransaction
): Promise<
  Booking & { timeSlots: Array<{ openHour: string; closeHour: string }> }
> {
  const client = tx || prisma;

  const booking = await client.booking.create({
    data: {
      courtId: data.courtId,
      userId: data.userId,
      orderId: data.orderId,
      source: data.source || "YOLO",
      bookingDate: data.bookingDate,
      bookingCode: data.bookingCode,
      duration: data.duration,
      totalPrice: data.totalPrice,
      status: data.status || BookingStatus.PENDING,
      timeSlots: {
        create: data.timeSlots,
      },
    },
    include: {
      timeSlots: true,
    },
  });

  return booking;
}
