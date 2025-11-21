import { useCallback, useState } from "react";
import type { PermissionTogglePayload } from "@/types/rbac";
import { rbacRequest } from "./useRbacRequest";

interface UseUpdateRolePermissions {
  updatePermissions: (changes: PermissionTogglePayload[]) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
}

export function useUpdateRolePermissions(
  roleId: string
): UseUpdateRolePermissions {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePermissions = useCallback(
    async (changes: PermissionTogglePayload[]) => {
      if (!roleId || !changes.length) return;

      try {
        setIsUpdating(true);
        setError(null);
        await rbacRequest(`/api/rbac/roles/${roleId}/permissions`, {
          method: "PUT",
          body: JSON.stringify({ permissions: changes }),
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Gagal memperbarui permission role";
        setError(message);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [roleId]
  );

  return {
    updatePermissions,
    isUpdating,
    error,
  };
}

