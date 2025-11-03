// src/lib/services/booking.service.ts
import { prisma } from "@/lib/prisma";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";
import { BookingStatus, Booking, Role } from "@/types/prisma";
import { activityLogService } from "@/lib/services/activity-log.service";
import { requirePermission, ServiceContext } from "@/types/service-context";
import { BookingCreateData } from "../validations/booking.validation";
import { customAlphabet } from "nanoid";

export const bookingService = {
  // Get all bookings with related data
  getAll: async () => {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          court: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true
                }
              }
            }
          },
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatar: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true,
              channelName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
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
        message: error instanceof Error ? error.message : "Get all bookings failed",
      };
    }
  },

  // Get bookings by user
  getByUser: async (userId: string) => {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          userId
        },
        include: {
          court: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true,
              channelName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
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
        message: error instanceof Error ? error.message : "Get user bookings failed",
      };
    }
  },

  // Get bookings by court
  getByCourt: async (courtId: string) => {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          courtId
        },
        include: {
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatar: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true,
              channelName: true
            }
          },
        },
        orderBy: {
          bookingDate: 'asc'
        }
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
        message: error instanceof Error ? error.message : "Get court bookings failed",
      };
    }
  },

  // Get bookings by status
  getByStatus: async (status: BookingStatus) => {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          status
        },
        include: {
          court: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true
                }
              }
            }
          },
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatar: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true,
              channelName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
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
        message: error instanceof Error ? error.message : `Get ${status.toLowerCase()} bookings failed`,
      };
    }
  },

  // Get booking by ID
  getById: async (id: string) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: {
          id
        },
        include: {
          court: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true,
                  address: true,
                  phone: true
                }
              }
            }
          },
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatar: true
                }
              }
            }
          },
          payments: true,
          blocking: true
        }
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
      const bookingCode = `#BK-${nanoId}`

      const bookingData = {
        courtId: booking.courtId,
        userId: context.actorUserId || "",
        source: "YOLO system",
        bookingDate: new Date(booking.bookingDate),
        bookingHour: booking.bookingHour,
        duration: booking.duration,
        totalPrice: booking.totalPrice,
        status: BookingStatus.PENDING,
        bookingCode: bookingCode,
        courtsideCourtId: null,
        createdAt: currentDate,
        updatedAt: currentDate
      }

      const newBooking = await prisma.booking.create({
        data: bookingData
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
        message: error instanceof Error ? error.message : "Create booking failed",
      };
    }
  },
};
