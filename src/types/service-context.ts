import { UserType } from "@/types/prisma";

export interface ServiceContext {
  userRole: UserType;
  assignedVenueId?: string | string[];
  actorUserId?: string; // for audit logging
}

export const createServiceContext = (
  userRole: UserType,
  actorUserId: string,
  assignedVenueId?: string | string[]
): ServiceContext => ({
  userRole,
  assignedVenueId,
  actorUserId,
});

export const hasPermission = (
  context: ServiceContext,
  requiredRole: UserType
): boolean => {
  const roleHierarchy: Record<UserType, number> = {
    USER: 1,
    STAFF: 2,
    ADMIN: 3,
  };

  return roleHierarchy[context.userRole] >= roleHierarchy[requiredRole];
};

export const requirePermission = (
  context: ServiceContext,
  requiredRole: UserType
) => {
  if (!hasPermission(context, requiredRole)) {
    return {
      success: false,
      data: null,
      message: "You are not authorized to access this resource",
    };
  }

  return null;
};
