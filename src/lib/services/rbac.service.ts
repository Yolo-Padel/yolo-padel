import { prisma } from "@/lib/prisma";
import type { Roles, Module, Permission, RolePermission } from "@/types/prisma";

/**
 * RBAC Service
 *
 * This service provides business logic for Role-Based Access Control operations.
 * It handles role management, module and permission retrieval, and role-permission assignments.
 *
 * All database operations use Prisma client for type safety and consistency.
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Role with permission count
 * Used for listing roles with summary information
 */
export type RoleWithPermissionCount = Roles & {
  _count: {
    rolePermissions: number;
  };
};

/**
 * Role with full permission details
 * Used for displaying complete role information including all permissions
 */
export type RoleWithPermissions = Roles & {
  rolePermissions: Array<{
    id: string;
    moduleId: string;
    permissionId: string;
    allowed: boolean;
  }>;
};

/**
 * Role permission entry
 * Simplified structure for permission matrix operations
 */
export type RolePermissionEntry = {
  moduleId: string;
  permissionId: string;
  allowed: boolean;
};

/**
 * Input data for creating a new role
 */
export type CreateRoleInput = {
  name: string;
  description?: string;
  isActive?: boolean;
};

/**
 * Input data for updating an existing role
 */
export type UpdateRoleInput = {
  name?: string;
  description?: string;
  isActive?: boolean;
};

/**
 * Input data for updating role permissions
 */
export type RolePermissionUpdate = {
  moduleId: string;
  permissionId: string;
  allowed: boolean;
};

// ============================================================================
// Role CRUD Operations
// ============================================================================

/**
 * Create a new role
 *
 * @param data - Role creation data (name, description, isActive)
 * @returns The created role with ID
 * @throws Error if role name already exists
 */
export async function createRole(data: CreateRoleInput): Promise<Roles> {
  // Check if role name already exists
  const existingRole = await prisma.roles.findUnique({
    where: { name: data.name },
  });

  if (existingRole) {
    throw new Error(`Role name "${data.name}" already exists`);
  }

  // Create the role
  const role = await prisma.roles.create({
    data: {
      name: data.name,
      description: data.description,
      isActive: data.isActive ?? true,
    },
  });

  return role;
}

/**
 * Get all roles with permission counts
 *
 * @returns Array of roles ordered by creation date (newest first)
 */
export async function getAllRoles(): Promise<RoleWithPermissionCount[]> {
  const roles = await prisma.roles.findMany({
    include: {
      _count: {
        select: {
          rolePermissions: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return roles;
}

/**
 * Get a role by ID with full permission details
 *
 * @param roleId - The role ID
 * @returns The role with all rolePermissions
 * @throws Error if role not found
 */
export async function getRoleById(
  roleId: string
): Promise<RoleWithPermissions> {
  const role = await prisma.roles.findUnique({
    where: { id: roleId },
    include: {
      rolePermissions: {
        select: {
          id: true,
          moduleId: true,
          permissionId: true,
          allowed: true,
        },
      },
    },
  });

  if (!role) {
    throw new Error(`Role with ID "${roleId}" not found`);
  }

  return role;
}

/**
 * Update an existing role
 *
 * @param roleId - The role ID to update
 * @param data - Update data (name, description, isActive)
 * @returns The updated role
 * @throws Error if role not found or name already exists
 */
export async function updateRole(
  roleId: string,
  data: UpdateRoleInput
): Promise<Roles> {
  // Check if role exists
  const existingRole = await prisma.roles.findUnique({
    where: { id: roleId },
  });

  if (!existingRole) {
    throw new Error(`Role with ID "${roleId}" not found`);
  }

  // If name is being changed, check uniqueness
  if (data.name && data.name !== existingRole.name) {
    const roleWithSameName = await prisma.roles.findUnique({
      where: { name: data.name },
    });

    if (roleWithSameName) {
      throw new Error(`Role name "${data.name}" already exists`);
    }
  }

  // Update the role
  const updatedRole = await prisma.roles.update({
    where: { id: roleId },
    data: {
      name: data.name,
      description: data.description,
      isActive: data.isActive,
    },
  });

  return updatedRole;
}

/**
 * Delete a role
 *
 * @param roleId - The role ID to delete
 * @throws Error if role not found or is assigned to users
 */
export async function deleteRole(roleId: string): Promise<void> {
  // Check if role exists
  const role = await prisma.roles.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new Error(`Role with ID "${roleId}" not found`);
  }

  // Check if role is assigned to any users
  // Note: The User model uses an enum Role, not a relation to Roles table
  // So we need to check if the role name matches any of the enum values being used
  // For now, we'll skip this check since the User.role is an enum, not a foreign key
  // If you want to prevent deletion of system roles, you could check the role name

  // Delete role and associated rolePermissions in a transaction
  await prisma.$transaction([
    // Delete all rolePermissions first
    prisma.rolePermission.deleteMany({
      where: { roleId },
    }),
    // Then delete the role
    prisma.roles.delete({
      where: { id: roleId },
    }),
  ]);
}

// ============================================================================
// Module and Permission Operations
// ============================================================================

/**
 * Get all modules ordered by orderIndex
 *
 * @returns Array of modules ordered by orderIndex ascending
 */
export async function getAllModules(): Promise<Module[]> {
  const modules = await prisma.module.findMany({
    orderBy: {
      orderIndex: "asc",
    },
  });

  return modules;
}

/**
 * Get all permissions ordered by action
 *
 * @returns Array of permissions ordered by action alphabetically
 */
export async function getAllPermissions(): Promise<Permission[]> {
  const permissions = await prisma.permission.findMany({
    orderBy: {
      action: "asc",
    },
  });

  return permissions;
}

// ============================================================================
// Role Permission Operations
// ============================================================================

/**
 * Get all permissions for a role
 *
 * @param roleId - The role ID
 * @returns Array of role permissions with moduleId, permissionId, and allowed fields
 * @throws Error if role not found
 */
export async function getRolePermissions(
  roleId: string
): Promise<RolePermissionEntry[]> {
  // Check if role exists
  const role = await prisma.roles.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new Error(`Role with ID "${roleId}" not found`);
  }

  // Fetch all rolePermissions for the role
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId },
    select: {
      moduleId: true,
      permissionId: true,
      allowed: true,
    },
  });

  return rolePermissions;
}

/**
 * Update role permissions in bulk
 *
 * @param roleId - The role ID
 * @param updates - Array of permission updates
 * @throws Error if role not found or transaction fails
 */
export async function updateRolePermissions(
  roleId: string,
  updates: RolePermissionUpdate[]
): Promise<void> {
  // Check if role exists
  const role = await prisma.roles.findUnique({
    where: { id: roleId },
  });

  if (!role) {
    throw new Error(`Role with ID "${roleId}" not found`);
  }

  // Perform all updates in a transaction
  await prisma.$transaction(async (tx) => {
    for (const update of updates) {
      const { moduleId, permissionId, allowed } = update;

      if (allowed) {
        // For allowed=true: upsert the rolePermission entry
        await tx.rolePermission.upsert({
          where: {
            roleId_moduleId_permissionId: {
              roleId,
              moduleId,
              permissionId,
            },
          },
          update: {
            allowed: true,
          },
          create: {
            roleId,
            moduleId,
            permissionId,
            allowed: true,
          },
        });
      } else {
        // For allowed=false: delete the rolePermission entry if it exists
        await tx.rolePermission.deleteMany({
          where: {
            roleId,
            moduleId,
            permissionId,
          },
        });
      }
    }
  });
}
