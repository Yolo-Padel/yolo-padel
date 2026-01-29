import { useMemo } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useModules, useRolePermissions } from "@/hooks/use-rbac";
import { UserType } from "@/types/prisma";

interface UsePermissionGuardParams {
  moduleKey: string;
  action: string;
}

interface UsePermissionGuardResult {
  isLoading: boolean;
  canAccess: boolean;
}

export function usePermissionGuard({
  moduleKey,
  action,
}: UsePermissionGuardParams): UsePermissionGuardResult {
  const { user } = useAuth();

  // Handle loading state - user not yet loaded
  if (!user) {
    return {
      isLoading: true,
      canAccess: false,
    };
  }

  // ADMIN bypass: Grant immediate access without permission checks
  if (user.userType === UserType.ADMIN) {
    return {
      isLoading: false,
      canAccess: true,
    };
  }

  // For STAFF users, continue with existing permission check logic
  const roleId = user?.roleId ?? "";

  const { data: modulesData, isLoading: isModulesLoading } = useModules();
  const { data: rolePermissions, isLoading: isRolePermissionsLoading } =
    useRolePermissions(roleId, Boolean(roleId));

  const moduleId = useMemo(() => {
    if (!modulesData?.modules?.length) {
      return null;
    }

    return (
      modulesData.modules.find((module) => module.key === moduleKey)?.id ?? null
    );
  }, [modulesData, moduleKey]);

  const permissionId = useMemo(() => {
    if (!modulesData?.permissions?.length) {
      return null;
    }

    return (
      modulesData.permissions.find((permission) => permission.action === action)
        ?.id ?? null
    );
  }, [modulesData, action]);

  const canAccess = useMemo(() => {
    if (!rolePermissions || !moduleId || !permissionId) {
      return false;
    }

    return rolePermissions.some(
      (permission) =>
        permission.moduleId === moduleId &&
        permission.permissionId === permissionId &&
        permission.allowed
    );
  }, [rolePermissions, moduleId, permissionId]);

  return {
    isLoading: isModulesLoading || isRolePermissionsLoading,
    canAccess,
  };
}
