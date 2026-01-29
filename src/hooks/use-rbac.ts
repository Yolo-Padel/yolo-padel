import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════

/**
 * Base role type
 */
export type Role = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Role with permission count
 */
export type RoleWithPermissionCount = Role & {
  _count: {
    rolePermissions: number;
  };
  allowedPermissionCount: number;
};

/**
 * Role with full permission details
 */
export type RoleWithPermissions = Role & {
  rolePermissions: Array<{
    id: string;
    moduleId: string;
    permissionId: string;
    allowed: boolean;
  }>;
};

/**
 * Module type
 */
export type Module = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  orderIndex: number;
  isActive: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Permission type
 */
export type Permission = {
  id: string;
  action: string;
  orderIndex: number;
};

/**
 * Role permission entry
 */
export type RolePermissionEntry = {
  moduleId: string;
  permissionId: string;
  allowed: boolean;
};

/**
 * Input for creating a new role
 */
export type CreateRoleInput = {
  name: string;
  description?: string;
  isActive?: boolean;
};

/**
 * Input for updating an existing role
 */
export type UpdateRoleInput = {
  name?: string;
  description?: string;
  isActive?: boolean;
};

/**
 * Input for updating role permissions
 */
export type RolePermissionUpdate = {
  moduleId: string;
  permissionId: string;
  allowed: boolean;
};

// ════════════════════════════════════════════════════════
// API Functions
// ════════════════════════════════════════════════════════

/**
 * Fetch all roles with permission counts
 */
async function getRolesApi(): Promise<RoleWithPermissionCount[]> {
  const response = await fetch("/api/rbac/roles");

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to get roles");
  }

  return result.data;
}

/**
 * Fetch a single role by ID with full details
 */
async function getRoleByIdApi(roleId: string): Promise<RoleWithPermissions> {
  const response = await fetch(`/api/rbac/roles/${roleId}`);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to get role");
  }

  return result.data;
}

/**
 * Fetch all modules and permissions
 */
async function getModulesApi(): Promise<{
  modules: Module[];
  permissions: Permission[];
}> {
  const response = await fetch("/api/rbac/modules");

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to get modules");
  }

  return result.data;
}

/**
 * Fetch role permissions for a specific role
 */
async function getRolePermissionsApi(
  roleId: string
): Promise<RolePermissionEntry[]> {
  const response = await fetch(`/api/rbac/roles/${roleId}/permissions`);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to get role permissions");
  }

  return result.data;
}

/**
 * Create a new role
 */
async function createRoleApi(data: CreateRoleInput): Promise<Role> {
  const response = await fetch("/api/rbac/roles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to create role");
  }

  return result.data;
}

/**
 * Update an existing role
 */
async function updateRoleApi(
  roleId: string,
  data: UpdateRoleInput
): Promise<Role> {
  const response = await fetch(`/api/rbac/roles/${roleId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to update role");
  }

  return result.data;
}

/**
 * Delete a role
 */
async function deleteRoleApi(roleId: string): Promise<void> {
  const response = await fetch(`/api/rbac/roles/${roleId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || "Failed to delete role");
  }
}

/**
 * Update role permissions in bulk
 */
async function updateRolePermissionsApi(
  roleId: string,
  updates: RolePermissionUpdate[]
): Promise<void> {
  const response = await fetch(`/api/rbac/roles/${roleId}/permissions`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ updates }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to update role permissions");
  }
}

// ════════════════════════════════════════════════════════
// Hooks
// ════════════════════════════════════════════════════════

/**
 * Hook to fetch all roles with permission counts
 *
 * @returns Query result with roles data, loading, and error states
 *
 * @example
 * ```tsx
 * const { data: roles, isLoading, error } = useRoles();
 * ```
 */
export function useRoles() {
  return useQuery({
    queryKey: ["rbac", "roles"],
    queryFn: getRolesApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single role by ID with full details
 *
 * @param roleId - The ID of the role to fetch
 * @param enabled - Whether to execute the query (default: true)
 * @returns Query result with role data, loading, and error states
 *
 * @example
 * ```tsx
 * const { data: role, isLoading, error } = useRoleById(roleId);
 * ```
 */
export function useRoleById(roleId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["rbac", "roles", roleId],
    queryFn: () => getRoleByIdApi(roleId),
    enabled: enabled && !!roleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch all modules and permissions
 *
 * @returns Query result with modules and permissions data, loading, and error states
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useModules();
 * const modules = data?.modules || [];
 * const permissions = data?.permissions || [];
 * ```
 */
export function useModules() {
  return useQuery<{ modules: Module[]; permissions: Permission[] }>({
    queryKey: ["rbac", "modules"],
    queryFn: getModulesApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch role permissions for a specific role
 *
 * @param roleId - The ID of the role to fetch permissions for
 * @param enabled - Whether to execute the query (default: true)
 * @returns Query result with role permissions data, loading, and error states
 *
 * @example
 * ```tsx
 * const { data: permissions, isLoading, error } = useRolePermissions(roleId);
 * ```
 */
export function useRolePermissions(roleId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["rbac", "roles", roleId, "permissions"],
    queryFn: () => getRolePermissionsApi(roleId),
    enabled: enabled && !!roleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ════════════════════════════════════════════════════════
// Mutation Hooks
// ════════════════════════════════════════════════════════

/**
 * Hook to create a new role
 *
 * @returns Mutation function and state for creating a role
 *
 * @example
 * ```tsx
 * const createRole = useCreateRole();
 *
 * createRole.mutate({
 *   name: "Manager",
 *   description: "Manager role",
 *   isActive: true
 * });
 * ```
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRoleApi,
    onSuccess: () => {
      // Invalidate roles query to refresh the list
      queryClient.resetQueries({ queryKey: ["rbac", "roles"] });

      // Show success toast
      toast.success("Role created successfully");
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error("Failed to create role", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update an existing role
 *
 * @returns Mutation function and state for updating a role
 *
 * @example
 * ```tsx
 * const updateRole = useUpdateRole();
 *
 * updateRole.mutate({
 *   roleId: "role-id",
 *   data: {
 *     name: "Updated Manager",
 *     isActive: false
 *   }
 * });
 * ```
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: UpdateRoleInput }) =>
      updateRoleApi(roleId, data),
    onSuccess: (_, variables) => {
      // Invalidate roles list query
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });

      // Invalidate specific role query
      queryClient.invalidateQueries({
        queryKey: ["rbac", "roles", variables.roleId],
      });

      // Show success toast
      toast.success("Role updated successfully");
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error("Failed to update role", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to delete a role
 *
 * @returns Mutation function and state for deleting a role
 *
 * @example
 * ```tsx
 * const deleteRole = useDeleteRole();
 *
 * deleteRole.mutate("role-id");
 * ```
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRoleApi,
    onSuccess: () => {
      // Invalidate roles query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["rbac", "roles"] });

      // Show success toast
      toast.success("Role deleted successfully");
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error("Failed to delete role", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update role permissions in bulk
 *
 * @returns Mutation function and state for updating role permissions
 *
 * @example
 * ```tsx
 * const updateRolePermissions = useUpdateRolePermissions();
 *
 * updateRolePermissions.mutate({
 *   roleId: "role-id",
 *   updates: [
 *     { moduleId: "module-1", permissionId: "perm-1", allowed: true },
 *     { moduleId: "module-2", permissionId: "perm-2", allowed: false }
 *   ]
 * });
 * ```
 */
export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      updates,
    }: {
      roleId: string;
      updates: RolePermissionUpdate[];
    }) => updateRolePermissionsApi(roleId, updates),
    onSuccess: (_, variables) => {
      // Invalidate specific role query
      queryClient.invalidateQueries({
        queryKey: ["rbac", "roles", variables.roleId],
      });

      // Invalidate role permissions query
      queryClient.invalidateQueries({
        queryKey: ["rbac", "roles", variables.roleId, "permissions"],
      });

      // Show success toast
      toast.success("Permissions updated successfully");
    },
    onError: (error: Error) => {
      // Show error toast
      toast.error("Failed to update permissions", {
        description: error.message,
      });
    },
  });
}
