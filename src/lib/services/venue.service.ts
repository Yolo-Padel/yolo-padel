import { prisma } from "../prisma";
import {
  VenueCreateData,
  VenueDeleteData,
  VenueUpdateData,
} from "../validations/venue.validation";
import { ServiceContext, requirePermission } from "@/types/service-context";
import { UserType } from "@/types/prisma";
import {
  activityLogService,
  buildChangesDiff,
} from "@/lib/services/activity-log.service";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";
import { vercelBlobService } from "@/lib/services/vercel-blob.service";

export const venueService = {
  getAll: async (context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.USER);
      if (accessError) return accessError;

      // Build where clause based on user type
      const whereClause: any = { isArchived: false };

      if (context.userRole === UserType.USER) {
        // USER: only active venues
        whereClause.isActive = true;
      } else if (context.userRole === UserType.STAFF) {
        // STAFF: only assigned venues (active or inactive)
        const assignedVenues = Array.isArray(context.assignedVenueId)
          ? context.assignedVenueId
          : context.assignedVenueId
            ? [context.assignedVenueId]
            : [];
        whereClause.id = { in: assignedVenues };
      }
      // ADMIN: all venues (no additional filter)

      const venues = await prisma.venue.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
      });

      // Enrich with counts: courts count and today's bookings count per venue
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const enriched = await Promise.all(
        venues.map(async (venue) => {
          const [courtsCount, bookingsToday] = await Promise.all([
            prisma.court.count({
              where: { venueId: venue.id, isArchived: false },
            }),
            prisma.booking.count({
              where: {
                bookingDate: { gte: startOfDay, lte: endOfDay },
                court: { venueId: venue.id },
              },
            }),
          ]);
          return {
            ...venue,
            _counts: {
              courts: courtsCount,
              bookingsToday,
            },
          } as any;
        })
      );

      return {
        success: true,
        data: enriched,
        message: "Get all venues successful",
      };
    } catch (error) {
      console.error("Get all venues error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Get all venues failed",
      };
    }
  },
  getPublicList: async () => {
    try {
      const venues = await prisma.venue.findMany({
        where: { isArchived: false, isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          address: true,
          city: true,
          description: true,
          images: true,
          openHour: true,
          closeHour: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        success: true,
        data: venues,
        message: "Get public venues successful",
      };
    } catch (error) {
      console.error("Get public venues error:", error);
      return {
        success: false,
        data: null,
        message:
          error instanceof Error ? error.message : "Get public venues failed",
      };
    }
  },
  getById: async (venueId: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.USER);
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
        message:
          error instanceof Error ? error.message : "Get venue by id failed",
      };
    }
  },
  create: async (
    data: VenueCreateData,
    context: ServiceContext,
    userId: string
  ) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      const baseSlug = data.name.trim().toLowerCase().replace(/\s+/g, "-");
      // Ambil semua slug yang diawali baseSlug untuk menentukan sufiks unik
      const existing = await prisma.venue.findMany({
        where: { slug: { startsWith: baseSlug } },
        select: { slug: true },
      });

      const existingSet = new Set(existing.map((e) => e.slug));
      const nextUniqueSlug = (() => {
        if (!existingSet.has(baseSlug)) return baseSlug;
        let suffix = 2;
        while (existingSet.has(`${baseSlug}-${suffix}`)) suffix += 1;
        return `${baseSlug}-${suffix}`;
      })();

      const createData: any = {
        name: data.name,
        slug: nextUniqueSlug,
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
      const accessError = requirePermission(context, UserType.STAFF);
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

      // Delete old images that are being removed
      if (payload.images && exist.images) {
        const oldImages = exist.images as string[];
        const newImages = payload.images as string[];

        // Find images that exist in old but not in new (removed images)
        const removedImages = oldImages.filter(
          (img) => !newImages.includes(img)
        );

        // Delete each removed image from storage
        for (const imageUrl of removedImages) {
          console.log("Deleting old venue image:", imageUrl);
          const deleteResult = await vercelBlobService.deleteFile(imageUrl);
          if (!deleteResult.success) {
            console.warn(
              "Failed to delete old venue image:",
              deleteResult.message
            );
            // Continue with update even if delete fails (non-blocking)
          }
        }
      }

      let slugUpdate: string | undefined;
      if (payload.name) {
        const baseSlug = payload.name.trim().toLowerCase().replace(/\s+/g, "-");
        // Cari slug yang konflik (kecuali venue ini sendiri)
        const existing = await prisma.venue.findMany({
          where: {
            slug: { startsWith: baseSlug },
            NOT: { id: venueId },
          },
          select: { slug: true },
        });
        const existingSet = new Set(existing.map((e) => e.slug));
        if (!existingSet.has(baseSlug)) slugUpdate = baseSlug;
        else {
          let suffix = 2;
          while (existingSet.has(`${baseSlug}-${suffix}`)) suffix += 1;
          slugUpdate = `${baseSlug}-${suffix}`;
        }
      }

      const updateData: any = {
        ...payload,
        ...(slugUpdate ? { slug: slugUpdate } : {}),
      };

      const result = await prisma.venue.update({
        where: { id: venueId },
        data: updateData,
      });
      const diff = buildChangesDiff(
        exist as any,
        { ...exist, ...updateData } as any,
        Object.keys(updateData) as any
      );
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
      const accessError = requirePermission(context, UserType.STAFF);
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
        changes: {
          before: { isArchived: false },
          after: { isArchived: true },
        } as any,
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
};
