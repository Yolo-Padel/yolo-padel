import { Role } from "@/types/prisma";

export interface ServiceContext {
  userRole: Role;
  assignedVenueId?: string;
}

export const createServiceContext = (
  userRole: Role,
  assignedVenueId?: string,
): ServiceContext => ({
  userRole,
  assignedVenueId,
});

export const hasPermission = (context: ServiceContext, requiredRole: Role): boolean => {
  const roleHierarchy: Record<Role, number> = {
    USER: 1,
    FINANCE: 2,
    ADMIN: 3,
    SUPER_ADMIN: 4,
  };

  return roleHierarchy[context.userRole] >= roleHierarchy[requiredRole];
};

export const requirePermission = (context: ServiceContext, requiredRole: Role) => {
    if (!hasPermission(context, requiredRole)) {
        return {
        success: false,
        data: null,
        message: "You are not authorized to access this resource",
        };
    }
    
    return null;
};
