import { prisma } from "@/lib/prisma";
import { UserType } from "@/types/prisma";
import { ServiceContext, requirePermission } from "@/types/service-context";
import {
  CourtDynamicPriceCreateData,
  CourtDynamicPriceUpdateData,
} from "@/lib/validations/court-dynamic-price.validation";
import { activityLogService, buildChangesDiff } from "./activity-log.service";
import { ACTION_TYPES } from "@/types/action";
import { ENTITY_TYPES } from "@/types/entity";

const buildSuccess = <T>(data: T, message: string) => ({
  success: true,
  data,
  message,
});

const buildError = (message: string) => ({
  success: false,
  data: null,
  message,
});

const ensureCourtAccess = async (courtId: string, context: ServiceContext) => {
  const court = await prisma.court.findUnique({
    where: { id: courtId },
    select: {
      id: true,
      venueId: true,
    },
  });

  if (!court) {
    return {
      error: buildError("Court not found"),
    };
  }

  if (
    context.userRole === UserType.STAFF &&
    context.assignedVenueId &&
    // court.venueId !== context.assignedVenueId
    !context.assignedVenueId.includes(court.venueId)
  ) {
    return {
      error: buildError("You are not authorized to access this court"),
    };
  }

  return { court };
};

const ensureDynamicPriceAccess = async (
  id: string,
  context: ServiceContext
) => {
  const dynamicPrice = await prisma.courtDynamicPrice.findUnique({
    where: { id },
    include: {
      court: {
        select: {
          id: true,
          venueId: true,
        },
      },
    },
  });

  if (!dynamicPrice) {
    return {
      error: buildError("Dynamic price not found"),
    };
  }

  if (
    context.userRole === UserType.STAFF &&
    context.assignedVenueId &&
    dynamicPrice.court.venueId !== context.assignedVenueId
  ) {
    return {
      error: buildError("You are not authorized to access this dynamic price"),
    };
  }

  return { dynamicPrice };
};

const timeStringToMinutes = (time: string) => {
  const [hoursStr, minutesStr] = time.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  return hours * 60 + minutes;
};

const minutesToTimeString = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours.toString().padStart(2, "0")}:${remainingMinutes
    .toString()
    .padStart(2, "0")}`;
};

export const courtDynamicPriceService = {
  listByCourt: async (courtId: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      const { error } = await ensureCourtAccess(courtId, context);
      if (error) return error;

      const dynamicPrices = await prisma.courtDynamicPrice.findMany({
        where: {
          courtId,
          isArchived: false,
        } as any,
        include: {
          court: true,
        },
        orderBy: [{ dayOfWeek: "asc" }, { date: "asc" }, { startHour: "asc" }],
      });

      return buildSuccess(dynamicPrices, "Dynamic prices fetched successfully");
    } catch (err) {
      console.error("listByCourt dynamic prices error:", err);
      return buildError("Failed to fetch dynamic prices");
    }
  },

  getById: async (id: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      const { dynamicPrice, error } = await ensureDynamicPriceAccess(
        id,
        context
      );
      if (error) return error;

      return buildSuccess(dynamicPrice, "Dynamic price fetched successfully");
    } catch (err) {
      console.error("getById dynamic price error:", err);
      return buildError("Failed to fetch dynamic price");
    }
  },

  create: async (
    data: CourtDynamicPriceCreateData,
    context: ServiceContext
  ) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      const { error } = await ensureCourtAccess(data.courtId, context);
      if (error) return error;

      const baseData = {
        courtId: data.courtId,
        dayOfWeek: data.dayOfWeek ?? null,
        date: data.date ?? null,
        price: data.price,
        isActive: data.isActive ?? true,
        isArchived: false,
      };

      const dynamicPrice = await prisma.courtDynamicPrice.create({
        data: {
          ...baseData,
          startHour: data.startHour,
          endHour: data.endHour,
        },
      });

      // Log activity for dynamic price creation
      activityLogService.record({
        context,
        action: ACTION_TYPES.CREATE_DYNAMIC_PRICE,
        entityType: ENTITY_TYPES.DYNAMIC_PRICE,
        entityId: dynamicPrice.id,
        changes: {
          before: {},
          after: {
            courtId: dynamicPrice.courtId,
            price: dynamicPrice.price,
            dayOfWeek: dynamicPrice.dayOfWeek,
            date: dynamicPrice.date,
            startHour: dynamicPrice.startHour,
            endHour: dynamicPrice.endHour,
          },
        },
      });

      return buildSuccess(dynamicPrice, "Dynamic price created successfully");
    } catch (err) {
      console.error("create dynamic price error:", err);
      return buildError("Failed to create dynamic price");
    }
  },

  update: async (
    id: string,
    data: CourtDynamicPriceUpdateData,
    context: ServiceContext
  ) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      const { dynamicPrice, error } = await ensureDynamicPriceAccess(
        id,
        context
      );
      if (error) return error;

      if (data.startHour !== undefined || data.endHour !== undefined) {
        return buildError("Updating startHour/endHour is not allowed");
      }

      // Capture before state for diff
      const beforeState = {
        dayOfWeek: dynamicPrice.dayOfWeek,
        date: dynamicPrice.date,
        price: dynamicPrice.price,
        isActive: dynamicPrice.isActive,
      };

      const resolvedDayOfWeek =
        data.dayOfWeek !== undefined
          ? (data.dayOfWeek ?? null)
          : dynamicPrice.dayOfWeek;
      const resolvedDate =
        data.date !== undefined ? (data.date ?? null) : dynamicPrice.date;
      const resolvedPrice = data.price ?? dynamicPrice.price;
      const resolvedIsActive =
        data.isActive !== undefined ? data.isActive : dynamicPrice.isActive;

      const updatedDynamicPrice = await prisma.courtDynamicPrice.update({
        where: { id: dynamicPrice.id },
        data: {
          dayOfWeek: resolvedDayOfWeek,
          date: resolvedDate,
          price: resolvedPrice,
          isActive: resolvedIsActive,
        },
      });

      // Capture after state for diff
      const afterState = {
        dayOfWeek: updatedDynamicPrice.dayOfWeek,
        date: updatedDynamicPrice.date,
        price: updatedDynamicPrice.price,
        isActive: updatedDynamicPrice.isActive,
      };

      // Build changes diff and log activity
      const changesDiff = buildChangesDiff(beforeState, afterState);
      if (changesDiff) {
        activityLogService.record({
          context,
          action: ACTION_TYPES.UPDATE_DYNAMIC_PRICE,
          entityType: ENTITY_TYPES.DYNAMIC_PRICE,
          entityId: updatedDynamicPrice.id,
          changes: changesDiff,
        });
      }

      return buildSuccess(
        updatedDynamicPrice,
        "Dynamic price updated successfully"
      );
    } catch (err) {
      console.error("update dynamic price error:", err);
      return buildError("Failed to update dynamic price");
    }
  },

  delete: async (id: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, UserType.STAFF);
      if (accessError) return accessError;

      const { dynamicPrice, error } = await ensureDynamicPriceAccess(
        id,
        context
      );
      if (error) return error;

      const isArchived =
        (dynamicPrice as typeof dynamicPrice & { isArchived?: boolean })
          .isArchived ?? false;

      if (isArchived) {
        return buildSuccess(null, "Dynamic price already archived");
      }

      await prisma.courtDynamicPrice.update({
        where: { id: dynamicPrice.id },
        data: {
          isArchived: true,
        } as any,
      });

      // Log activity for dynamic price deletion (archive)
      activityLogService.record({
        context,
        action: ACTION_TYPES.DELETE_DYNAMIC_PRICE,
        entityType: ENTITY_TYPES.DYNAMIC_PRICE,
        entityId: dynamicPrice.id,
        changes: {
          before: {
            courtId: dynamicPrice.courtId,
            price: dynamicPrice.price,
            dayOfWeek: dynamicPrice.dayOfWeek,
            date: dynamicPrice.date,
            startHour: dynamicPrice.startHour,
            endHour: dynamicPrice.endHour,
            isActive: dynamicPrice.isActive,
          },
          after: {
            isArchived: true,
          },
        },
      });

      return buildSuccess(null, "Dynamic price deleted successfully");
    } catch (err) {
      console.error("delete dynamic price error:", err);
      return buildError("Failed to delete dynamic price");
    }
  },
};
