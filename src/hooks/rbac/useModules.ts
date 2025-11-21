import { useCallback, useEffect, useState } from "react";
import type { Module, Permission } from "@prisma/client";
import type { ModulesResponsePayload } from "@/types/rbac";
import { rbacRequest } from "./useRbacRequest";

interface UseModulesState {
  modules: Module[];
  permissions: Permission[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useModules(): UseModulesState {
  const [modules, setModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await rbacRequest<ModulesResponsePayload>(
        "/api/rbac/modules"
      );
      setModules(data?.modules ?? []);
      setPermissions(data?.permissions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat modules");
      setModules([]);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchModules();
  }, [fetchModules]);

  return {
    modules,
    permissions,
    isLoading,
    error,
    refetch: fetchModules,
  };
}

