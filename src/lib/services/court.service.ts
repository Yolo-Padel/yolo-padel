// src/lib/services/court.service.ts
import { prisma } from "@/lib/prisma";
import { CourtCreateData } from "@/lib/validations/court.validation";
import { OpeningHoursType, DayOfWeek, Role } from "@/types/prisma";
import { ServiceContext, hasPermission, requirePermission } from "@/types/service-context";
import { activityLogService, buildChangesDiff } from "@/lib/services/activity-log.service";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";

export const courtService = {
  // Get all courts with venue and schedule info
  getAll: async (context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.USER);
      if (accessError) return accessError;

      const courts = await prisma.court.findMany({
        where: { isArchived: false},
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          operatingHours: {
            include: {
              slots: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const filteredCourts = courts.filter((court) => {
        if (context.userRole === Role.ADMIN ||      context.userRole === Role.FINANCE) {
          return court.venueId === context.assignedVenueId;
        }
        return true;
      });

      return {
        success: true,
        data: filteredCourts,
        message: "Get all courts successful",
      };
    } catch (error) {
      console.error("Get all courts error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Get all courts failed",
      };
    }
  },

  // Get courts by venue
  getByVenue: async (venueId: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.FINANCE);
      if (accessError) return accessError;

      const courts = await prisma.court.findMany({
        where: {
          venueId,
          isArchived: false
        },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          operatingHours: {
            include: {
              slots: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      if ((context.userRole === Role.ADMIN || context.userRole === Role.FINANCE) && venueId !== context.assignedVenueId) {
        return {
          success: false,
          data: null,
          message: "You are not authorized to access this resource",
        };
      }

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
        message: error instanceof Error ? error.message : "Get courts by venue failed",
      };
    }
  },

  // Get court by ID with full details
  getById: async (id: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.USER);
      if (accessError) return accessError;

      const court = await prisma.court.findUnique({
        where: { id },
        include: {
          venue: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          operatingHours: {
            include: {
              slots: true
            }
          }
        }
      });

      if (!court) {
        return {
          success: false,
          data: null,
          message: "Court not found",
        };
      }
      
      // Check venue access for ADMIN/FINANCE roles
      if ((context.userRole === Role.ADMIN || context.userRole === Role.FINANCE) && court.venueId !== context.assignedVenueId) {
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
        message: error instanceof Error ? error.message : "Get court by id failed",
      };
    }
  },

  // Create new court
  create: async (data: CourtCreateData, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.SUPER_ADMIN);
      if (accessError) return accessError;

      // 1. Get venue data for REGULAR opening hours
      let venueOpenHour;
      let venueCloseHour;
      
      if (data.openingHours === OpeningHoursType.REGULAR) {
        const venue = await prisma.venue.findUnique({
          where: { id: data.venueId }
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
          openingType: data.openingHours,
          venueId: data.venueId
        }
      });

      // 3. Create operating hours based on type
      if (data.openingHours === OpeningHoursType.REGULAR) {
        // Generate REGULAR schedule for all days using venue hours
        const daysOfWeek: DayOfWeek[] = [
          'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 
          'FRIDAY', 'SATURDAY', 'SUNDAY'
        ];
        
        for (const dayOfWeek of daysOfWeek) {
          const operatingHour = await prisma.courtOperatingHour.create({
            data: {
              courtId: court.id,
              dayOfWeek,
              closed: false // All days open for REGULAR
            }
          });

          // Create time slot using venue hours
          await prisma.courtTimeSlot.create({
            data: {
              courtOperatingHourId: operatingHour.id,
              openHour: venueOpenHour!,
              closeHour: venueCloseHour!
            }
          });
        }
      } else if (data.openingHours === OpeningHoursType.WITHOUT_FIXED) {
        // Create custom schedule
        for (const [dayName, dayData] of Object.entries(data.schedule)) {
          const dayOfWeek = dayName.toUpperCase() as DayOfWeek;
          
          const operatingHour = await prisma.courtOperatingHour.create({
            data: {
              courtId: court.id,
              dayOfWeek,
              closed: dayData.closed
            }
          });

          // Create time slots if not closed
          if (!dayData.closed && dayData.timeSlots) {
            for (const slot of dayData.timeSlots) {
              await prisma.courtTimeSlot.create({
                data: {
                  courtOperatingHourId: operatingHour.id,
                  openHour: slot.openHour,
                  closeHour: slot.closeHour
                }
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
              slug: true
            }
          },
          operatingHours: {
            include: {
              slots: true
            }
          }
        }
      });

      // audit log
      activityLogService.record({
        context,
        action: ACTION_TYPES.CREATE_COURT,
        entityType: ENTITY_TYPES.COURT,
        entityId: court.id,
        changes: {
          before: {},
          after: {
            name: data.courtName,
            price: data.price,
            openingType: data.openingHours,
            venueId: data.venueId,
          }
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
  update: async (id: string, data: CourtCreateData, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.SUPER_ADMIN);
      if (accessError) return accessError;


      console.log("updating court")
      // 1. Check if court exists
      const existingCourt = await prisma.court.findUnique({
        where: { id }
      });

      if (!existingCourt) {
        return {
          success: false,
          data: null,
          message: "Court not found",
        };
      }

      console.log('existingCourt', existingCourt);

      // 2. Get venue data for REGULAR opening hours
      let venueOpenHour;
      let venueCloseHour;
      
      if (data.openingHours === OpeningHoursType.REGULAR) {
        const venue = await prisma.venue.findUnique({
          where: { id: data.venueId }
        }) as any;
        
        if (venue) {
          venueOpenHour = venue.openHour;
          venueCloseHour = venue.closeHour;
        }
      }

      // 3. Update court basic info
      console.log("Service update - data received:", data);
      console.log("Service update - price value:", data.price);
      console.log("Service update - price type:", typeof data.price);
      
      const court = await prisma.court.update({
        where: { id },
        data: {
          name: data.courtName,
          price: data.price,
          openingType: data.openingHours,
          venueId: data.venueId
        }
      });

      console.log("Service update - updated court:", court);
      console.log("Service update - updated price:", court.price);

      // 4. Delete existing operating hours
      await prisma.courtOperatingHour.deleteMany({
        where: { courtId: id }
      });

      // 5. Create new operating hours based on type
      if (data.openingHours === OpeningHoursType.REGULAR) {
        // Generate REGULAR schedule for all days using venue hours
        const daysOfWeek: DayOfWeek[] = [
          'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 
          'FRIDAY', 'SATURDAY', 'SUNDAY'
        ];
        
        for (const dayOfWeek of daysOfWeek) {
          const operatingHour = await prisma.courtOperatingHour.create({
            data: {
              courtId: court.id,
              dayOfWeek,
              closed: false // All days open for REGULAR
            }
          });

          // Create time slot using venue hours
          await prisma.courtTimeSlot.create({
            data: {
              courtOperatingHourId: operatingHour.id,
              openHour: venueOpenHour,
              closeHour: venueCloseHour
            }
          });
        }
      } else if (data.openingHours === OpeningHoursType.WITHOUT_FIXED) {
        // Create custom schedule
        for (const [dayName, dayData] of Object.entries(data.schedule)) {
          const dayOfWeek = dayName.toUpperCase() as DayOfWeek;
          
          const operatingHour = await prisma.courtOperatingHour.create({
            data: {
              courtId: court.id,
              dayOfWeek,
              closed: dayData.closed
            }
          });

          // Create time slots if not closed
          if (!dayData.closed && dayData.timeSlots) {
            for (const slot of dayData.timeSlots) {
              await prisma.courtTimeSlot.create({
                data: {
                  courtOperatingHourId: operatingHour.id,
                  openHour: slot.openHour,
                  closeHour: slot.closeHour
                }
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
              slug: true
            }
          },
          operatingHours: {
            include: {
              slots: true
            }
          }
        }
      });

      console.log('updatedCourt', updatedCourt)

      // audit log
      const courtDiff = buildChangesDiff(existingCourt as any, {
        ...existingCourt,
        name: data.courtName,
        price: data.price,
        openingType: data.openingHours,
        venueId: data.venueId,
      } as any, ["name", "price", "openingType", "venueId"] as any);

      activityLogService.record({
        context,
        action: ACTION_TYPES.UPDATE_COURT,
        entityType: ENTITY_TYPES.COURT,
        entityId: court.id,
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
    const accessError = requirePermission(context, Role.SUPER_ADMIN);
    if (accessError) return accessError;

    try {
      const court = await prisma.court.findUnique({
        where: { id }
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
          isArchived: true,
        },
      });

      activityLogService.record({
        context,
        action: ACTION_TYPES.DELETE_COURT,
        entityType: ENTITY_TYPES.COURT,
        entityId: id,
        changes: { before: { isArchived: false }, after: { isArchived: true } } as any,
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
  toggleAvailability: async (id: string, isActive: boolean, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.SUPER_ADMIN);
      if (accessError) return accessError;

      const court = await prisma.court.findUnique({
        where: { id }
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

      const toggleDiff = { before: { isActive: court.isActive }, after: { isActive } } as any;
      activityLogService.record({
        context,
        action: ACTION_TYPES.UPDATE_COURT,
        entityType: ENTITY_TYPES.COURT,
        entityId: id,
        changes: toggleDiff,
      });

      return {
        success: true,
        data: result,
        message: `Court ${isActive ? 'activated' : 'deactivated'} successful`,
      };
    } catch (error) {
      console.error("Toggle court availability error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Toggle court availability failed",
      };
    }
  }
};