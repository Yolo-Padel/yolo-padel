// src/lib/services/court.service.ts
import { prisma } from "@/lib/prisma";
import { CourtCreateData } from "@/lib/validations/court.validation";
import {
  OpeningHoursType,
  DayOfWeek,
  UserType,
  BookingStatus,
} from "@/types/prisma";
import {
  ServiceContext,
  hasPermission,
  requirePermission,
} from "@/types/service-context";
import {
  activityLogService,
  buildChangesDiff,
  entityReferenceHelpers,
} from "@/lib/services/activity-log.service";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";
import { vercelBlobService } from "@/lib/services/vercel-blob.service";
import { getDayOfWeekKey } from "@/lib/booking-slots-utils";

export const courtService = {
  // Get all courts with venue and schedule info
  getAll: async (context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.USER);
      if (accessError) return accessError;

      // Build where clause based on user type
      const whereClause: any = { isArchived: false };

      if (context.userRole === UserType.USER) {
        // USER: only courts from active venues
        whereClause.venue = {
          isActive: true,
          isArchived: false,
        };
      } else if (context.userRole === UserType.STAFF) {
        // STAFF: only courts from assigned venues
        const assignedVenues = Array.isArray(context.assignedVenueId)
          ? context.assignedVenueId
          : context.assignedVenueId
            ? [context.assignedVenueId]
            : [];
        whereClause.venueId = { in: assignedVenues };
      }
      // ADMIN: all courts (no additional filter)

      const courts = await prisma.court.findMany({
        where: whereClause,
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          operatingHours: {
            include: {
              slots: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        success: true,
        data: courts,
        message: "Get all courts successful",
      };
    } catch (error) {
      console.error("Get all courts error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Get all courts failed",
      };
    }
  },
  // Get courts for public booking flow (no auth required)
  getPublicByVenue: async (venueId: string) => {
    try {
      const courts = await prisma.court.findMany({
        where: {
          venueId,
          isArchived: false,
          isActive: true,
          venue: {
            isArchived: false,
            isActive: true,
          },
        },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          operatingHours: {
            include: {
              slots: true,
            },
          },
          dynamicPrices: {
            where: {
              isActive: true,
              isArchived: false,
            },
            orderBy: [
              { dayOfWeek: "asc" },
              { date: "asc" },
              { startHour: "asc" },
            ],
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return {
        success: true,
        data: courts,
        message: "Get public courts by venue successful",
      };
    } catch (error) {
      console.error("Get public courts by venue error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Get public courts by venue failed",
      };
    }
  },

  // Get courts by venue
  getByVenue: async (venueId: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      const courts = await prisma.court.findMany({
        where: {
          venueId,
          isArchived: false,
        },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          operatingHours: {
            include: {
              slots: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return {
        success: true,
        data: courts,
        message: "Get courts by venue successful",
      };
    } catch (error) {
      console.error("Get courts by venue error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Get courts by venue failed",
      };
    }
  },

  // Get court by ID with full details
  getById: async (id: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.USER);
      if (accessError) return accessError;

      const court = await prisma.court.findUnique({
        where: { id },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          operatingHours: {
            include: {
              slots: true,
            },
          },
        },
      });

      if (!court) {
        return {
          success: false,
          data: null,
          message: "Court not found",
        };
      }

      // Check venue access for STAFF role
      if (
        context.userRole === UserType.STAFF &&
        context.assignedVenueId &&
        !context.assignedVenueId.includes(court.venueId)
      ) {
        return {
          success: false,
          data: null,
          message: "You are not authorized to access this resource",
        };
      }

      return {
        success: true,
        data: court,
        message: "Get court by id successful",
      };
    } catch (error) {
      console.error("Get court by id error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Get court by id failed",
      };
    }
  },

  // Create new court
  create: async (data: CourtCreateData, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      // 1. Get venue data for REGULAR opening hours
      let venueOpenHour;
      let venueCloseHour;

      if (data.openingHours === OpeningHoursType.REGULAR) {
        const venue = await prisma.venue.findUnique({
          where: { id: data.venueId },
        });

        if (venue) {
          venueOpenHour = venue.openHour;
          venueCloseHour = venue.closeHour;
        }
      }

      // 2. Create court
      const court = await prisma.court.create({
        data: {
          name: data.courtName,
          price: data.price,
          image: data.image, // Now mandatory from validation
          openingType: data.openingHours,
          venueId: data.venueId,
          ayoFieldId: data.ayoFieldId ?? null,
        },
      });

      // 3. Create operating hours based on type
      if (data.openingHours === OpeningHoursType.REGULAR) {
        // Generate REGULAR schedule for all days using venue hours
        const daysOfWeek: DayOfWeek[] = [
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ];

        for (const dayOfWeek of daysOfWeek) {
          const operatingHour = await prisma.courtOperatingHour.create({
            data: {
              courtId: court.id,
              dayOfWeek,
              closed: false, // All days open for REGULAR
            },
          });

          // Create time slot using venue hours
          await prisma.courtTimeSlot.create({
            data: {
              courtOperatingHourId: operatingHour.id,
              openHour: venueOpenHour!,
              closeHour: venueCloseHour!,
            },
          });
        }
      } else if (data.openingHours === OpeningHoursType.WITHOUT_FIXED) {
        // Create custom schedule
        for (const [dayName, dayData] of Object.entries(data.schedule ?? {})) {
          const dayOfWeek = dayName.toUpperCase() as DayOfWeek;

          const operatingHour = await prisma.courtOperatingHour.create({
            data: {
              courtId: court.id,
              dayOfWeek,
              closed: dayData.closed,
            },
          });

          // Create time slots if not closed
          if (!dayData.closed && dayData.timeSlots) {
            for (const slot of dayData.timeSlots) {
              await prisma.courtTimeSlot.create({
                data: {
                  courtOperatingHourId: operatingHour.id,
                  openHour: slot.openHour,
                  closeHour: slot.closeHour,
                },
              });
            }
          }
        }
      }

      // 3. Return created court with full details
      const createdCourt = await prisma.court.findUnique({
        where: { id: court.id },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          operatingHours: {
            include: {
              slots: true,
            },
          },
        },
      });

      // audit log
      activityLogService.record({
        context,
        action: ACTION_TYPES.CREATE_COURT,
        entityType: ENTITY_TYPES.COURT,
        entityId: court.id,
        entityReference: entityReferenceHelpers.court(court),
        changes: {
          before: {},
          after: {
            name: data.courtName,
            price: data.price,
            openingType: data.openingHours,
            venueId: data.venueId,
            ayoFieldId: data.ayoFieldId ?? null,
          },
        } as any,
      });

      return {
        success: true,
        data: createdCourt,
        message: "Create court successful",
      };
    } catch (error) {
      console.error("Create court error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Create court failed",
      };
    }
  },

  // Update court
  update: async (
    id: string,
    data: CourtCreateData,
    context: ServiceContext,
  ) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      // 1. Check if court exists
      const existingCourt = await prisma.court.findUnique({
        where: { id },
      });

      if (!existingCourt) {
        return {
          success: false,
          data: null,
          message: "Court not found",
        };
      }

      // 2. Delete old image if it's being replaced
      if (existingCourt.image && existingCourt.image !== data.image) {
        const deleteResult = await vercelBlobService.deleteFile(
          existingCourt.image,
        );
        if (!deleteResult.success) {
          console.warn(
            "Failed to delete old court image:",
            deleteResult.message,
          );
          // Continue with update even if delete fails (non-blocking)
        }
      }

      // 3. Get venue data for REGULAR opening hours
      let venueOpenHour;
      let venueCloseHour;

      if (data.openingHours === OpeningHoursType.REGULAR) {
        const venue = (await prisma.venue.findUnique({
          where: { id: data.venueId },
        })) as any;

        if (venue) {
          venueOpenHour = venue.openHour;
          venueCloseHour = venue.closeHour;
        }
      }

      const court = await prisma.court.update({
        where: { id },
        data: {
          name: data.courtName,
          price: data.price,
          image: data.image, // Now mandatory from validation
          openingType: data.openingHours,
          venueId: data.venueId,
          ayoFieldId: data.ayoFieldId ?? null,
        },
      });

      // 5. Delete existing operating hours
      await prisma.courtOperatingHour.deleteMany({
        where: { courtId: id },
      });

      // 6. Create new operating hours based on type
      if (data.openingHours === OpeningHoursType.REGULAR) {
        // Generate REGULAR schedule for all days using venue hours
        const daysOfWeek: DayOfWeek[] = [
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ];

        for (const dayOfWeek of daysOfWeek) {
          const operatingHour = await prisma.courtOperatingHour.create({
            data: {
              courtId: court.id,
              dayOfWeek,
              closed: false, // All days open for REGULAR
            },
          });

          // Create time slot using venue hours
          await prisma.courtTimeSlot.create({
            data: {
              courtOperatingHourId: operatingHour.id,
              openHour: venueOpenHour,
              closeHour: venueCloseHour,
            },
          });
        }
      } else if (data.openingHours === OpeningHoursType.WITHOUT_FIXED) {
        // Create custom schedule
        for (const [dayName, dayData] of Object.entries(data.schedule ?? {})) {
          const dayOfWeek = dayName.toUpperCase() as DayOfWeek;

          const operatingHour = await prisma.courtOperatingHour.create({
            data: {
              courtId: court.id,
              dayOfWeek,
              closed: dayData.closed,
            },
          });

          // Create time slots if not closed
          if (!dayData.closed && dayData.timeSlots) {
            for (const slot of dayData.timeSlots) {
              await prisma.courtTimeSlot.create({
                data: {
                  courtOperatingHourId: operatingHour.id,
                  openHour: slot.openHour,
                  closeHour: slot.closeHour,
                },
              });
            }
          }
        }
      }

      // 6. Return updated court with full details
      const updatedCourt = await prisma.court.findUnique({
        where: { id: court.id },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          operatingHours: {
            include: {
              slots: true,
            },
          },
        },
      });

      // audit log
      const courtDiff = buildChangesDiff(
        existingCourt as any,
        {
          ...existingCourt,
          name: data.courtName,
          price: data.price,
          openingType: data.openingHours,
          venueId: data.venueId,
          ayoFieldId: data.ayoFieldId ?? null,
        } as any,
        ["name", "price", "openingType", "venueId", "ayoFieldId"] as any,
      );

      activityLogService.record({
        context,
        action: ACTION_TYPES.UPDATE_COURT,
        entityType: ENTITY_TYPES.COURT,
        entityId: court.id,
        entityReference: entityReferenceHelpers.court(court),
        changes: (courtDiff as any) ?? null,
      });

      return {
        success: true,
        data: updatedCourt,
        message: "Update court successful",
      };
    } catch (error) {
      console.error("Update court error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Update court failed",
      };
    }
  },

  // Soft delete court
  delete: async (id: string, context: ServiceContext) => {
    const accessError = requirePermission(context, UserType.STAFF);
    if (accessError) return accessError;

    try {
      const court = await prisma.court.findUnique({
        where: { id },
      });

      if (!court) {
        return {
          success: false,
          data: null,
          message: "Court not found",
        };
      }

      // Check if there are active bookings for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      const activeBookingsToday = await prisma.booking.findFirst({
        where: {
          courtId: id,
          bookingDate: {
            gte: today,
            lte: endOfToday,
          },
          status: {
            not: BookingStatus.CANCELLED,
          },
        },
      });

      if (activeBookingsToday) {
        return {
          success: false,
          data: null,
          message:
            "Cannot delete court with active bookings for today. Please cancel the bookings first.",
        };
      }

      const result = await prisma.court.update({
        where: { id },
        data: {
          isArchived: true,
        },
      });

      activityLogService.record({
        context,
        action: ACTION_TYPES.DELETE_COURT,
        entityType: ENTITY_TYPES.COURT,
        entityId: id,
        entityReference: entityReferenceHelpers.court(court),
        changes: {
          before: { isArchived: false },
          after: { isArchived: true },
        } as any,
      });

      return {
        success: true,
        data: result,
        message: "Delete court successful",
      };
    } catch (error) {
      console.error("Delete court error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Delete court failed",
      };
    }
  },

  // Toggle court availability
  toggleAvailability: async (
    id: string,
    isActive: boolean,
    context: ServiceContext,
  ) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      const court = await prisma.court.findUnique({
        where: { id },
      });

      if (!court) {
        return {
          success: false,
          data: null,
          message: "Court not found",
        };
      }

      const result = await prisma.court.update({
        where: { id },
        data: {
          isActive,
        },
      });

      const toggleDiff = {
        before: { isActive: court.isActive },
        after: { isActive },
      } as any;
      activityLogService.record({
        context,
        action: ACTION_TYPES.UPDATE_COURT,
        entityType: ENTITY_TYPES.COURT,
        entityId: id,
        entityReference: entityReferenceHelpers.court(result),
        changes: toggleDiff,
      });

      return {
        success: true,
        data: result,
        message: `Court ${isActive ? "activated" : "deactivated"} successful`,
      };
    } catch (error) {
      console.error("Toggle court availability error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Toggle court availability failed",
      };
    }
  },

  // Get available time slots for a court on a specific date
  // Returns breakdown of hourly slots with availability check
  getAvailableTimeSlots: async (courtId: string, date: Date) => {
    try {
      // 1. Get court with operating hours and venue
      const court = await prisma.court.findUnique({
        where: { id: courtId },
        include: {
          operatingHours: {
            include: {
              slots: true,
            },
          },
        },
      });

      if (!court) {
        return {
          success: false,
          data: null,
          message: "Court not found",
        };
      }

      // 2. Get day of week from date
      const dayOfWeek = getDayOfWeekKey(date);
      if (!dayOfWeek) {
        return {
          success: false,
          data: null,
          message: "Invalid date",
        };
      }

      // 3. Get operating hour for the day
      const operatingHour = court.operatingHours.find(
        (oh) => oh.dayOfWeek === dayOfWeek,
      );

      if (!operatingHour || operatingHour.closed) {
        return {
          success: true,
          data: {
            availableSlotRanges: [],
            bookedRanges: [],
          },
          message: "Court is closed on this day",
        };
      }

      // 4. Generate all possible hourly slots from operating hours
      // Format: ["06.00–07.00", "07.00–08.00", ...] (hourly slots only)
      const allPossibleSlots: string[] = [];
      const timeSlotRanges = operatingHour.slots.map((slot) => ({
        openHour: slot.openHour,
        closeHour: slot.closeHour,
      }));

      // Generate hourly slots for each time slot range
      for (const range of timeSlotRanges) {
        const [openHour, openMin] = range.openHour.split(":").map(Number);
        const [closeHour, closeMin] = range.closeHour.split(":").map(Number);
        const start = new Date(0, 0, 0, openHour, openMin, 0);
        const end = new Date(0, 0, 0, closeHour, closeMin, 0);
        const current = new Date(start);

        const formatTime = (d: Date) =>
          `${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;

        while (current < end) {
          const next = new Date(current);
          next.setHours(next.getHours() + 1);
          if (next > end) break;

          // Generate hourly slot in UI format
          allPossibleSlots.push(`${formatTime(current)}–${formatTime(next)}`);
          current.setHours(current.getHours() + 1);
        }
      }

      // 5. Get all bookings for this court and date (excluding cancelled)
      // This includes both regular bookings and blocking bookings
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const bookings = await prisma.booking.findMany({
        where: {
          courtId,
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
        },
      });

      // 6. Collect all booked/blocked time ranges from internal bookings
      const bookedRanges: Array<{ openHour: string; closeHour: string }> = [];

      for (const booking of bookings) {
        for (const slot of booking.timeSlots) {
          bookedRanges.push({
            openHour: slot.openHour,
            closeHour: slot.closeHour,
          });
        }
      }

      // 8. Helper function to check if a slot overlaps with booked ranges
      const isSlotOverlapping = (
        slotStart: string,
        slotEnd: string,
      ): boolean => {
        // Convert UI format "06.00" to DB format "06:00"
        const dbStart = slotStart.replace(".", ":");
        const dbEnd = slotEnd.replace(".", ":");

        return bookedRanges.some((range) => {
          // Check if ranges overlap
          return (
            (dbStart < range.closeHour && dbEnd > range.openHour) ||
            (dbStart === range.openHour && dbEnd === range.closeHour)
          );
        });
      };

      const availableSlotRanges = allPossibleSlots.filter((slot) => {
        const [slotStart, slotEnd] = slot.split("–");
        return !isSlotOverlapping(slotStart, slotEnd);
      });

      return {
        success: true,
        data: {
          availableSlotRanges, // Ready-to-use slot ranges for ToggleGroup
          bookedRanges,
        },
        message: "Available time slots retrieved successfully",
      };
    } catch (error) {
      console.error("Get available time slots error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Get available time slots failed",
      };
    }
  },
};
