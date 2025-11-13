import { prisma } from "@/lib/prisma";
import { Role } from "@/types/prisma";
import {
  ServiceContext,
  requirePermission,
} from "@/types/service-context";
import {
  CourtPricingOverrideCreateData,
  CourtPricingOverrideUpdateData,
} from "@/lib/validations/court-pricing-rule.validation";

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

const ensureRuleAccess = async (id: string, context: ServiceContext) => {
  const rule = await prisma.courtPricingOverride.findUnique({
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

  if (!rule) {
    return {
      error: buildError("Pricing rule not found"),
    };
  }

  if (
    (context.userRole === Role.ADMIN || context.userRole === Role.FINANCE) &&
    context.assignedVenueId &&
    rule.court.venueId !== context.assignedVenueId
  ) {
    return {
      error: buildError("You are not authorized to access this pricing rule"),
    };
  }

  return { rule };
};

export const courtPricingRuleService = {
  listByCourt: async (courtId: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.FINANCE);
      if (accessError) return accessError;

      const { error } = await ensureCourtAccess(courtId, context);
      if (error) return error;

      const rules = await prisma.courtPricingOverride.findMany({
        where: { courtId },
        orderBy: [
          { dayOfWeek: "asc" },
          { date: "asc" },
          { startHour: "asc" },
        ],
      });

      return buildSuccess(rules, "Pricing rules fetched successfully");
    } catch (err) {
      console.error("listByCourt pricing rules error:", err);
      return buildError("Failed to fetch pricing rules");
    }
  },

  getById: async (id: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.FINANCE);
      if (accessError) return accessError;

      const { rule, error } = await ensureRuleAccess(id, context);
      if (error) return error;

      return buildSuccess(rule, "Pricing rule fetched successfully");
    } catch (err) {
      console.error("getById pricing rule error:", err);
      return buildError("Failed to fetch pricing rule");
    }
  },

  create: async (
    data: CourtPricingOverrideCreateData,
    context: ServiceContext
  ) => {
    try {
      const accessError = requirePermission(context, Role.ADMIN);
      if (accessError) return accessError;

      const { error } = await ensureCourtAccess(data.courtId, context);
      if (error) return error;

      const rule = await prisma.courtPricingOverride.create({
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

      return buildSuccess(rule, "Pricing rule created successfully");
    } catch (err) {
      console.error("create pricing rule error:", err);
      return buildError("Failed to create pricing rule");
    }
  },

  update: async (
    id: string,
    data: CourtPricingOverrideUpdateData,
    context: ServiceContext
  ) => {
    try {
      const accessError = requirePermission(context, Role.ADMIN);
      if (accessError) return accessError;

      const { rule, error } = await ensureRuleAccess(id, context);
      if (error) return error;

      const updateData: CourtPricingOverrideUpdateData = {
        dayOfWeek:
          data.dayOfWeek !== undefined ? data.dayOfWeek ?? null : undefined,
        date: data.date !== undefined ? data.date ?? null : undefined,
        startHour: data.startHour,
        endHour: data.endHour,
        price: data.price,
        isActive: data.isActive,
      };

      const updatedRule = await prisma.courtPricingOverride.update({
        where: { id: rule.id },
        data: updateData,
      });

      return buildSuccess(updatedRule, "Pricing rule updated successfully");
    } catch (err) {
      console.error("update pricing rule error:", err);
      return buildError("Failed to update pricing rule");
    }
  },

  delete: async (id: string, context: ServiceContext) => {
    try {
      const accessError = requirePermission(context, Role.ADMIN);
      if (accessError) return accessError;

      const { rule, error } = await ensureRuleAccess(id, context);
      if (error) return error;

      await prisma.courtPricingOverride.delete({
        where: { id: rule.id },
      });

      return buildSuccess(null, "Pricing rule deleted successfully");
    } catch (err) {
      console.error("delete pricing rule error:", err);
      return buildError("Failed to delete pricing rule");
    }
  },
};


