import { prisma } from "@/lib/prisma";
import { UserType } from "@/types/prisma";
import { requirePermission, ServiceContext } from "@/types/service-context";

export const membershipService = {
  getMemberships: async (context: ServiceContext) => {
    const accessError = requirePermission(context, UserType.STAFF);
    if (accessError) return accessError;
    const memberships = await prisma.membership.findMany({
      where: {
        isArchived: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return {
      success: true,
      data: memberships,
      message: "Get memberships successful",
    };
  },
};
