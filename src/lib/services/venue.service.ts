import { prisma } from "../prisma";
import { VenueCreateData, VenueDeleteData, VenueUpdateData } from "../validations/venue.validation";
import { ServiceContext, requirePermission } from "@/types/service-context";
import { Role } from "@/types/prisma";
import { activityLogService, buildChangesDiff } from "@/lib/services/activity-log.service";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";

export const venueService = {
  getAll: async (context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.USER);
      if (accessError) return accessError;

      const venues = await prisma.venue.findMany({
        where: { isArchived: false },
        orderBy: { createdAt: "desc" },
      });

      // Filter venues berdasarkan role
      const filteredVenues = venues.filter((venue) => {
        if (context.userRole === Role.ADMIN || context.userRole === Role.FINANCE) {
          return venue.id === context.assignedVenueId;
        }
        return true; // USER dan SUPER_ADMIN bisa akses semua venue
      });
      
      return {
        success: true,
        data: filteredVenues,
        message: "Get all venues successful",
      };
    } catch (error) {
      console.error("Get all venues error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Get all venues failed",
      };
    }
  },
  getById: async (venueId: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.USER);
      if (accessError) return accessError;

      const venue = await prisma.venue.findUnique({
        where: { id: venueId },
      });

      if (!venue || venue.isArchived) {
        return {
          success: false,
          data: null,
          message: "Venue not found",
        };
      }

      // Check venue access untuk ADMIN/FINANCE roles
      if ((context.userRole === Role.ADMIN || context.userRole === Role.FINANCE) && venue.id !== context.assignedVenueId) {
        return {
          success: false,
          data: null,
          message: "You are not authorized to access this resource",
        };
      }

      return {
        success: true,
        data: venue,
        message: "Get venue by id successful",
      };
    } catch (error) {
      console.error("Get venue by id error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Get venue by id failed",
      };
    }
  },
  create: async (data: VenueCreateData, context: ServiceContext, userId: string) => {
    try {
      const accessError = requirePermission(context, Role.SUPER_ADMIN);
      if (accessError) return accessError;

      const createData: any = {
        name: data.name,
        slug: data.name.trim().toLowerCase().replace(/\s+/g, "-"),
        images: data.images ?? [],
        isActive: data.isActive ?? true,
        createdById: userId,
      };

      // Only add optional fields if they have values
      if (data.address) createData.address = data.address;
      if (data.description) createData.description = data.description;
      if (data.city) createData.city = data.city;
      if (data.phone) createData.phone = data.phone;
      if (data.openHour) createData.openHour = data.openHour;
      if (data.closeHour) createData.closeHour = data.closeHour;

      const result = await prisma.venue.create({
        data: createData,
      });
      // audit log
      activityLogService.record({
        context,
        action: ACTION_TYPES.CREATE_VENUE,
        entityType: ENTITY_TYPES.VENUE,
        entityId: result.id,
        changes: { before: {}, after: createData } as any,
      });
      return {
        success: true,
        data: result,
        message: "Create venue successful",
      };
    } catch (error) {
      console.error("Create venue error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Create venue failed",
      };
    }
  },
  update: async (data: VenueUpdateData, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.SUPER_ADMIN);
      if (accessError) return accessError;

      const { venueId, ...payload } = data;

      const exist = await prisma.venue.findUnique({ where: { id: venueId } });
      if (!exist || exist.isArchived) {
        return {
          success: false,
          data: null,
          message: "Venue not found",
        };
      }

      const updateData: any = {
        ...payload,
        ...(payload.name
          ? { slug: payload.name.trim().toLowerCase().replace(/\s+/g, "-") }
          : {}),
      };

      const result = await prisma.venue.update({
        where: { id: venueId },
        data: updateData,
      });
      const diff = buildChangesDiff(exist as any, { ...exist, ...updateData } as any, Object.keys(updateData) as any);
      activityLogService.record({
        context,
        action: ACTION_TYPES.UPDATE_VENUE,
        entityType: ENTITY_TYPES.VENUE,
        entityId: venueId,
        changes: (diff as any) ?? null,
      });

      return {
        success: true,
        data: result,
        message: "Update venue successful",
      };
    } catch (error) {
      console.error("Update venue error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Update venue failed",
      };
    }
  },
  delete: async (data: VenueDeleteData, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.SUPER_ADMIN);
      if (accessError) return accessError;

      await prisma.venue.update({
        where: { id: data.venueId },
        data: { isArchived: true },
      });
      activityLogService.record({
        context,
        action: ACTION_TYPES.DELETE_VENUE,
        entityType: ENTITY_TYPES.VENUE,
        entityId: data.venueId,
        changes: { before: { isArchived: false }, after: { isArchived: true } } as any,
      });
      return {
        success: true,
        message: "Delete venue successful",
      };
    } catch (error) {
      console.error("Delete venue error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Delete venue failed",
      };
    }
  },
}