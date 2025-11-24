import { prisma } from "@/lib/prisma";
import { RequestContext } from "@/types/request-context";
import { requireModulePermission } from "@/lib/rbac/permission-checker";
import {
  CourtDynamicPriceCreateData,
  CourtDynamicPriceUpdateData,
} from "@/lib/validations/court-dynamic-price.validation";

// Service metadata for RBAC
export const courtDynamicPriceServiceMetadata = {
  moduleKey: "dynamic_price", // Harus match dengan key di tabel modules
  serviceName: "courtDynamicPriceService",
  description: "Court dynamic price management operations",
} as const;

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

const ensureCourtAccess = async (courtId: string, context: RequestContext) => {
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

  // Check venue access berdasarkan assignedVenueId
  if (context.assignedVenueId) {
    const venueIds = Array.isArray(context.assignedVenueId)
      ? context.assignedVenueId
      : [context.assignedVenueId];
    if (!venueIds.includes(court.venueId)) {
      return {
        error: buildError("You are not authorized to access this court"),
      };
    }
  }

  return { court };
};

const ensureDynamicPriceAccess = async (
  id: string,
  context: RequestContext
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

  // Check venue access berdasarkan assignedVenueId
  if (context.assignedVenueId) {
    const venueIds = Array.isArray(context.assignedVenueId)
      ? context.assignedVenueId
      : [context.assignedVenueId];
    if (!venueIds.includes(dynamicPrice.court.venueId)) {
      return {
        error: buildError(
          "You are not authorized to access this dynamic price"
        ),
      };
    }
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
  listByCourt: async (courtId: string, context: RequestContext) => {
    try {
      const accessError = await requireModulePermission(
        context,
        courtDynamicPriceServiceMetadata.moduleKey,
        "read"
      );
      if (accessError) return accessError;

      const { error } = await ensureCourtAccess(courtId, context);
      if (error) return error;

      const dynamicPrices = await prisma.courtDynamicPrice.findMany({
        where: {
          courtId,
          isArchived: false,
        } as any,
        orderBy: [{ dayOfWeek: "asc" }, { date: "asc" }, { startHour: "asc" }],
      });

      return buildSuccess(dynamicPrices, "Dynamic prices fetched successfully");
    } catch (err) {
      console.error("listByCourt dynamic prices error:", err);
      return buildError("Failed to fetch dynamic prices");
    }
  },

  getById: async (id: string, context: RequestContext) => {
    try {
      const accessError = await requireModulePermission(
        context,
        courtDynamicPriceServiceMetadata.moduleKey,
        "read"
      );
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
    context: RequestContext
  ) => {
    try {
      const accessError = await requireModulePermission(
        context,
        courtDynamicPriceServiceMetadata.moduleKey,
        "create"
      );
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

      return buildSuccess(dynamicPrice, "Dynamic price created successfully");
    } catch (err) {
      console.error("create dynamic price error:", err);
      return buildError("Failed to create dynamic price");
    }
  },

  update: async (
    id: string,
    data: CourtDynamicPriceUpdateData,
    context: RequestContext
  ) => {
    try {
      const accessError = await requireModulePermission(
        context,
        courtDynamicPriceServiceMetadata.moduleKey,
        "update"
      );
      if (accessError) return accessError;

      const { dynamicPrice, error } = await ensureDynamicPriceAccess(
        id,
        context
      );
      if (error) return error;

      if (data.startHour !== undefined || data.endHour !== undefined) {
        return buildError("Updating startHour/endHour is not allowed");
      }

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

      return buildSuccess(
        updatedDynamicPrice,
        "Dynamic price updated successfully"
      );
    } catch (err) {
      console.error("update dynamic price error:", err);
      return buildError("Failed to update dynamic price");
    }
  },

  delete: async (id: string, context: RequestContext) => {
    try {
      const accessError = await requireModulePermission(
        context,
        courtDynamicPriceServiceMetadata.moduleKey,
        "delete"
      );
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

      return buildSuccess(null, "Dynamic price deleted successfully");
    } catch (err) {
      console.error("delete dynamic price error:", err);
      return buildError("Failed to delete dynamic price");
    }
  },
};
