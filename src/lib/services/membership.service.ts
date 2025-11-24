import { prisma } from "@/lib/prisma";
import { RequestContext } from "@/types/request-context";
import { requireModulePermission } from "@/lib/rbac/permission-checker";

// Service metadata for RBAC
export const membershipServiceMetadata = {
  moduleKey: "membership", // Harus match dengan key di tabel modules
  serviceName: "membershipService",
  description: "Membership management operations",
} as const;

export const membershipService = {
  getMemberships: async (context: RequestContext) => {
    const accessError = await requireModulePermission(
      context,
      membershipServiceMetadata.moduleKey,
      "read"
    );
    if (accessError) return accessError;
    const memberships = await prisma.membership.findMany();
    return {
      success: true,
      data: memberships,
      message: "Get memberships successful",
    };
  },
};
