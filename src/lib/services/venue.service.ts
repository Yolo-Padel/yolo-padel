import { prisma } from "../prisma";

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
  }
}