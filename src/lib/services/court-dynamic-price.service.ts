import { prisma } from "@/lib/prisma";
import { Role } from "@/types/prisma";
import {
  ServiceContext,
  requirePermission,
} from "@/types/service-context";
import {
  CourtDynamicPriceCreateData,
  CourtDynamicPriceUpdateData,
} from "@/lib/validations/court-dynamic-price.validation";

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

const ensureCourtAccess = async (
  courtId: string,
  context: ServiceContext
) => {
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
    (context.userRole === Role.ADMIN || context.userRole === Role.FINANCE) &&
    context.assignedVenueId &&
    court.venueId !== context.assignedVenueId
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
    (context.userRole === Role.ADMIN || context.userRole === Role.FINANCE) &&
    context.assignedVenueId &&
    dynamicPrice.court.venueId !== context.assignedVenueId
  ) {
    return {
      error: buildError("You are not authorized to access this dynamic price"),
    };
  }

  return { dynamicPrice };
};

export const courtDynamicPriceService = {
  listByCourt: async (courtId: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.FINANCE);
      if (accessError) return accessError;

      const { error } = await ensureCourtAccess(courtId, context);
      if (error) return error;

      const dynamicPrices = await prisma.courtDynamicPrice.findMany({
        where: { courtId },
        orderBy: [
          { dayOfWeek: "asc" },
          { date: "asc" },
          { startHour: "asc" },
        ],
      });

      return buildSuccess(dynamicPrices, "Dynamic prices fetched successfully");
    } catch (err) {
      console.error("listByCourt dynamic prices error:", err);
      return buildError("Failed to fetch dynamic prices");
    }
  },

  getById: async (id: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.FINANCE);
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
      const accessError = requirePermission(context, Role.ADMIN);
      if (accessError) return accessError;

      const { error } = await ensureCourtAccess(data.courtId, context);
      if (error) return error;

      const dynamicPrice = await prisma.courtDynamicPrice.create({
        data: {
          courtId: data.courtId,
          dayOfWeek: data.dayOfWeek ?? null,
          date: data.date ?? null,
          startHour: data.startHour,
          endHour: data.endHour,
          price: data.price,
          isActive: data.isActive ?? true,
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
      const accessError = requirePermission(context, Role.ADMIN);
      if (accessError) return accessError;

      const { dynamicPrice, error } = await ensureDynamicPriceAccess(
        id,
        context
      );
      if (error) return error;

      const updateData: CourtDynamicPriceUpdateData = {
        dayOfWeek:
          data.dayOfWeek !== undefined ? data.dayOfWeek ?? null : undefined,
        date: data.date !== undefined ? data.date ?? null : undefined,
        startHour: data.startHour,
        endHour: data.endHour,
        price: data.price,
        isActive: data.isActive,
      };

      const updatedDynamicPrice = await prisma.courtDynamicPrice.update({
        where: { id: dynamicPrice.id },
        data: updateData,
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

  delete: async (id: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.ADMIN);
      if (accessError) return accessError;

      const { dynamicPrice, error } = await ensureDynamicPriceAccess(
        id,
        context
      );
      if (error) return error;

      await prisma.courtDynamicPrice.delete({
        where: { id: dynamicPrice.id },
      });

      return buildSuccess(null, "Dynamic price deleted successfully");
    } catch (err) {
      console.error("delete dynamic price error:", err);
      return buildError("Failed to delete dynamic price");
    }
  },
};

