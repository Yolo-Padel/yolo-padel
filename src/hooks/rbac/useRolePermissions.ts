import { useCallback, useEffect, useState } from "react";
import type {
  Module,
  Permission,
  RolePermission,
} from "@prisma/client";
import { rbacRequest } from "./useRbacRequest";

export type RolePermissionEntry = RolePermission & {
  module: Module;
  permission: Permission;
};

interface UseRolePermissionsState {
  permissions: RolePermissionEntry[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRolePermissions(roleId?: string): UseRolePermissionsState {
  const [permissions, setPermissions] = useState<RolePermissionEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(!!roleId);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!roleId) return;

    try {
      setIsLoading(true);
      setError(null);
      const { data } = await rbacRequest<RolePermissionEntry[]>(
        `/api/rbac/roles/${roleId}/permissions`
      );
      setPermissions(data ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat permission role"
      );
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    void fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    isLoading,
    error,
    refetch: fetchPermissions,
  };
}

