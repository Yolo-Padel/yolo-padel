import { prisma } from "@/lib/prisma";
import type {
  PermissionTogglePayload,
  RoleWithPermissions,
} from "@/types/rbac";
import type {
  Module,
  Permission,
  RolePermission,
  Roles,
} from "@prisma/client";

export interface CreateRoleInput {
  name: string;
  description?: string | null;
  isActive?: boolean;
  permissions?: PermissionTogglePayload[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export const rbacService = {
  async getRoles(): Promise<RoleWithPermissions[]> {
    return prisma.roles.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        rolePermissions: {
          include: {
            module: true,
            permission: true,
          },
        },
      },
    });
  },

  async getRoleById(id: string): Promise<RoleWithPermissions | null> {
    return prisma.roles.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            module: true,
            permission: true,
          },
        },
      },
    });
  },

  async createRole(data: CreateRoleInput): Promise<RoleWithPermissions> {
    return prisma.$transaction(async (tx) => {
      const role = await tx.roles.create({
        data: {
          name: data.name,
          description: data.description,
          isActive: data.isActive ?? true,
        },
      });

      if (data.permissions?.length) {
        await tx.rolePermission.createMany({
          data: data.permissions.map((permission) => ({
            roleId: role.id,
            moduleId: permission.moduleId,
            permissionId: permission.permissionId,
            allowed: permission.allowed,
          })),
          skipDuplicates: true,
        });
      }

      return tx.roles.findUniqueOrThrow({
        where: { id: role.id },
        include: {
          rolePermissions: {
            include: {
              module: true,
              permission: true,
            },
          },
        },
      });
    });
  },

  async updateRole(id: string, data: UpdateRoleInput): Promise<Roles> {
    return prisma.roles.update({
      where: { id },
      data,
    });
  },

  async deleteRole(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId: id } });
      await tx.roles.delete({ where: { id } });
    });
  },

  async getPermissionsByRole(roleId: string): Promise<
    Array<
      RolePermission & {
        module: Module;
        permission: Permission;
      }
    >
  > {
    return prisma.rolePermission.findMany({
      where: { roleId },
      include: { module: true, permission: true },
    });
  },

  async updateRolePermission(
    roleId: string,
    moduleId: string,
    permissionId: string,
    allowed: boolean
  ): Promise<RolePermission> {
    return prisma.rolePermission.upsert({
      where: {
        roleId_moduleId_permissionId: {
          roleId,
          moduleId,
          permissionId,
        },
      },
      update: { allowed },
      create: {
        roleId,
        moduleId,
        permissionId,
        allowed,
      },
    });
  },

  async getModules(): Promise<Module[]> {
    return prisma.module.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
    });
  },

  async getPermissions(): Promise<Permission[]> {
    return prisma.permission.findMany({
      orderBy: { action: "asc" },
    });
  },
};

