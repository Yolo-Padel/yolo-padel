import { prisma } from "../prisma";
import { VenueDeleteData } from "../validations/venue.validation";

export const venueService = {
  getAll: async () => {
    try {
      const result = await prisma.venue.findMany();
      
      return {
        success: true,
        data: result,
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
  delete: async (data: VenueDeleteData) => {
    try {
      await prisma.venue.update({
        where: { id: data.venueId },
        data: { isArchived: true },
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