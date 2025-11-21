import { useCallback, useEffect, useState } from "react";
import type { RoleWithPermissions } from "@/types/rbac";
import { rbacRequest } from "./useRbacRequest";

interface UseRolesState {
  roles: RoleWithPermissions[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRoles(): UseRolesState {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await rbacRequest<RoleWithPermissions[]>(
        "/api/rbac/roles"
      );
      setRoles(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat roles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    isLoading,
    error,
    refetch: fetchRoles,
  };
}

