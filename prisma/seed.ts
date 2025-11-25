import { PrismaClient, UserType } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed Script untuk RBAC (Role-Based Access Control)
 *
 * Script ini akan:
 * 1. Seed Modules (fitur-fitur sistem)
 * 2. Seed Permissions (CRUD actions)
 * 3. Seed Default Roles (super_admin, venue_manager, dll)
 * 4. Seed Role Permissions (mapping role ke module+permission)
 *
 * IDEMPOTENT: Script ini aman dijalankan berkali-kali
 * - Menggunakan upsert untuk modules dan permissions
 * - Tidak akan duplicate data
 */

// ============================================================================
// SEED DATA DEFINITIONS
// ============================================================================

const MODULES = [
  {
    key: "users",
    label: "Users",
    description: "Manage internal users",
    orderIndex: 1,
  },
  {
    key: "venues",
    label: "Venues",
    description: "Manage venues and settings",
    orderIndex: 2,
  },
  {
    key: "courts",
    label: "Courts",
    description: "Manage courts and schedules",
    orderIndex: 3,
  },
  {
    key: "bookings",
    label: "Bookings",
    description: "Monitor and administrate bookings",
    orderIndex: 4,
  },
  {
    key: "orders",
    label: "Orders",
    description: "Manage customer orders",
    orderIndex: 5,
  },
  {
    key: "roles",
    label: "Roles",
    description: "Manage system roles and permissions",
    orderIndex: 6,
  },
  {
    key: "logs",
    label: "Logs",
    description: "Manage system logs",
    orderIndex: 7,
  },
] as const;

const PERMISSIONS = [
  { action: "read", orderIndex: 1 },
  { action: "create", orderIndex: 2 },
  { action: "update", orderIndex: 3 },
  { action: "delete", orderIndex: 4 },
] as const;

const ROLES = [
  {
    name: "Director",
    description: "Role with full access to every module",
    isActive: true,
  },
  {
    name: "IT Division",
    description: "Manage system, users, and technical configurations",
    isActive: true,
  },
  {
    name: "Venue Manager",
    description: "Manage specific venues, courts, and bookings",
    isActive: true,
  },
  {
    name: "Finance",
    description: "View reports and manage orders/payments",
    isActive: true,
  },
  {
    name: "Reception",
    description: "Handle bookings and customer service",
    isActive: true,
  },
] as const;

/**
 * Role Permission Matrix
 * Defines which permissions each role has for each module
 *
 * Format: [roleKey][moduleKey] = ['create', 'read', 'update', 'delete']
 */
const ROLE_PERMISSIONS: Record<
  string,
  Record<string, Array<"create" | "read" | "update" | "delete">>
> = {
  Director: {
    users: ["create", "read", "update", "delete"],
    venues: ["create", "read", "update", "delete"],
    courts: ["create", "read", "update", "delete"],
    bookings: ["create", "read", "update", "delete"],
    orders: ["create", "read", "update", "delete"],
    roles: ["create", "read", "update", "delete"],
  },
  "IT Division": {
    users: ["create", "read", "update", "delete"],
    venues: ["create", "read", "update", "delete"],
    courts: ["create", "read", "update", "delete"],
    bookings: ["read"],
    orders: ["read"],
    roles: ["create", "read", "update", "delete"],
  },
  "Venue Manager": {
    users: ["read"],
    venues: ["read", "update"],
    courts: ["create", "read", "update", "delete"],
    bookings: ["create", "read", "update", "delete"],
    orders: ["read"],
    roles: [],
  },
  Finance: {
    users: [],
    venues: ["read"],
    courts: ["read"],
    bookings: ["read"],
    orders: ["read", "update"],
    roles: [],
  },
  Reception: {
    users: [],
    venues: ["read"],
    courts: ["read"],
    bookings: ["create", "read", "update"],
    orders: ["read"],
    roles: [],
  },
};

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedModules() {
  for (const moduleData of MODULES) {
    await prisma.module.upsert({
      where: { key: moduleData.key },
      update: {
        label: moduleData.label,
        description: moduleData.description,
        orderIndex: moduleData.orderIndex,
      },
      create: moduleData,
    });
  }
}

async function seedPermissions() {
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { action: permission.action },
      update: {},
      create: permission,
    });
  }
}

async function seedRoles() {
  for (const role of ROLES) {
    await prisma.roles.upsert({
      where: { name: role.name },
      update: {
        description: role.description,
        isActive: role.isActive,
      },
      create: role,
    });
  }
}

async function seedRolePermissions() {
  const modules = await prisma.module.findMany();
  const permissions = await prisma.permission.findMany();
  const roles = await prisma.roles.findMany();

  const moduleMap = new Map(modules.map((m) => [m.key, m.id]));
  const permissionMap = new Map(permissions.map((p) => [p.action, p.id]));
  const roleMap = new Map(roles.map((r) => [r.name, r.id]));

  for (const [roleName, modulePermissions] of Object.entries(
    ROLE_PERMISSIONS
  )) {
    const roleId = roleMap.get(roleName);
    if (!roleId) continue;

    for (const [moduleKey, actions] of Object.entries(modulePermissions)) {
      const moduleId = moduleMap.get(moduleKey);
      if (!moduleId) continue;

      for (const action of actions) {
        const permissionId = permissionMap.get(action);
        if (!permissionId) continue;

        await prisma.rolePermission.upsert({
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
      }
    }
  }
}

async function seedSystemAdmin() {
  const directorRole = await prisma.roles.findUnique({
    where: { name: "Director" },
  });

  if (!directorRole) {
    throw new Error("Director role not found. Run role seeding first.");
  }

  const hashedPassword = await bcrypt.hash("YoloPadel2024!", 10);

  await prisma.user.upsert({
    where: { email: "systemadmin@yolopadel.com" },
    update: {
      userType: UserType.ADMIN,
      roleId: directorRole.id,
      isEmailVerified: true,
    },
    create: {
      email: "systemadmin@yolopadel.com",
      password: hashedPassword,
      userType: UserType.ADMIN,
      roleId: directorRole.id,
      isEmailVerified: true,
      profile: {
        create: {
          fullName: "System Administrator",
        },
      },
    },
  });
}

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================

async function main() {
  await seedModules();
  await seedPermissions();
  await seedRoles();
  await seedRolePermissions();
  await seedSystemAdmin();
}

// ============================================================================
// EXECUTE
// ============================================================================

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
