import { prisma } from "@/lib/prisma";
import { CourtCreateInput } from "@/lib/validations/court.validation";

export const courtService = {
  getAll: async () => {
    try {
      // 1. Find all courts
      const result = await prisma.court.findMany();
      return {
        success: true,
        data: result,
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

  getAllActive: async () => {
    try {
      // 1. Find all active courts
      const result = await prisma.court.findMany({
        where: {
          isActive: true,
        },
      });
      return {
        success: true,
        data: result,
        message: "Get all active courts successful",
      };
    } catch (error) {
      console.error("Get all active courts error:", error);

      return {
        success: false,
        data: null,
        message:
          error instanceof Error
            ? error.message
            : "Get all active courts failed",
      };
    }
  },

  getById: async (id: string) => {
    try {
      // 1. Find court by id
      const result = await prisma.court.findUnique({
        where: { id },
      });

      if (!result) {
        return {
          success: false,
          data: null,
          message: "Court not found",
        };
      }

      return {
        success: true,
        data: result,
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

  create: async (data: CourtCreateInput) => {
    try {
      // 1. Create court
      const result = await prisma.court.create({
        data,
      });

      return {
        success: true,
        data: result,
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

  update: async (id: string, data: CourtCreateInput) => {
    try {
      // 1. Update court
      const result = await prisma.court.update({
        where: { id },
        data,
      });

      return {
        success: true,
        data: result,
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

  delete: async (id: string) => {
    try {
      // 1. Soft delete court
      const result = await prisma.court.update({
        where: { id },
        data: {
          isArchived: true,
        },
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
};
