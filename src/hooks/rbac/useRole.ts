import { useCallback, useEffect, useState } from "react";
import type { RoleWithPermissions } from "@/types/rbac";
import { rbacRequest } from "./useRbacRequest";

interface UseRoleState {
  role: RoleWithPermissions | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRole(roleId?: string): UseRoleState {
  const [role, setRole] = useState<RoleWithPermissions | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!!roleId);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = useCallback(async () => {
    if (!roleId) return;

    try {
      setIsLoading(true);
      setError(null);
      const { data } = await rbacRequest<RoleWithPermissions>(
        `/api/rbac/roles/${roleId}`
      );
      setRole(data ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data role");
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    void fetchRole();
  }, [fetchRole]);

  return {
    role,
    isLoading,
    error,
    refetch: fetchRole,
  };
}

