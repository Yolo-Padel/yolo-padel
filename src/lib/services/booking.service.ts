// src/lib/services/booking.service.ts
import { prisma } from "@/lib/prisma";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";
import { BookingStatus, Booking, Role } from "@/types/prisma";
import { activityLogService } from "@/lib/services/activity-log.service";
import { requirePermission, ServiceContext } from "@/types/service-context";
import { BookingCreateData } from "../validations/booking.validation";
import { customAlphabet } from "nanoid";

/**
 * Parse date string (YYYY-MM-DD) and return Date object representing start of day in UTC
 * This ensures consistent date storage regardless of timezone
 * @param dateString Date string in YYYY-MM-DD format
 * @returns Date object representing start of day in UTC
 */
function parseDateString(dateString: string): Date {
  // If it's already in ISO format with time, parse directly
  if (dateString.includes("T")) {
    return new Date(dateString);
  }

  // If it's YYYY-MM-DD format, parse as UTC start of day
  // This ensures the date is stored correctly
  // Example: "2024-11-09" -> 2024-11-09T00:00:00.000Z
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
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

  // Create booking
  create: async (booking: BookingCreateData, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.USER);
      if (accessError) return accessError;

      const nanoId = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 5);

      const currentDate = new Date();
      const bookingCode = `#BK-${nanoId()}`;

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
};
