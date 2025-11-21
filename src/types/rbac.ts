import type {
  Module,
  Permission,
  RolePermission,
  Roles,
} from "@prisma/client";

export type RoleWithPermissions = Roles & {
  rolePermissions: Array<
    RolePermission & {
      module: Module;
      permission: Permission;
    }
  >;
};

export interface PermissionTogglePayload {
  moduleId: string;
  permissionId: string;
  allowed: boolean;
}

export interface ModulesResponsePayload {
  modules: Module[];
  permissions: Permission[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}

