import { prisma } from "../prisma";
import { VenueCreateData, VenueDeleteData, VenueUpdateData } from "../validations/venue.validation";

export const venueService = {
  getAll: async () => {
    try {
      const result = await prisma.venue.findMany({
        where: { isArchived: false },
        orderBy: { createdAt: "desc" },
      });
      
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
  getById: async (venueId: string) => {
    try {
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
        message: error instanceof Error ? error.message : "Get venue by id failed",
      };
    }
  },
  create: async (data: VenueCreateData, createdById?: string) => {
    try {
      // If no createdById provided, find or create a default admin user
      let userId = createdById;
      if (!userId) {
        const defaultUser = await prisma.user.findFirst({
          where: { role: "ADMIN" }
        });
        
        if (!defaultUser) {
          // Create a default admin user if none exists
          const newUser = await prisma.user.create({
            data: {
              email: "admin@yolo-padel.com",
              password: "dummy-password",
              role: "ADMIN",
              userStatus: "ACTIVE",
              isEmailVerified: true,
              joinDate: new Date(),
            },
          });
          userId = newUser.id;
        } else {
          userId = defaultUser.id;
        }
      }

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
  update: async (data: VenueUpdateData) => {
    try {
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