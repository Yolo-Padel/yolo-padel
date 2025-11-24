import { prisma } from "@/lib/prisma";
import { RequestContext } from "@/types/request-context";

/**
 * Check permission langsung dari tabel role_permissions
 * Menggunakan roleId + moduleKey + action
 *
 * @param roleId - roleId dari Roles table
 * @param moduleKey - key dari Module table (e.g., 'user', 'venue', 'booking')
 * @param action - action dari Permission table (e.g., 'read', 'create', 'update', 'delete')
 * @returns true jika permission allowed, false jika tidak
 */
export async function checkRolePermission(
  roleId: string,
  moduleKey: string,
  action: string
): Promise<boolean> {
  try {
    // Query langsung ke RolePermission dengan join ke Module dan Permission
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        role: { id: roleId },
        module: { key: moduleKey, isActive: true },
        permission: { action },
        allowed: true,
      },
    });

    return !!rolePermission;
  } catch (error) {
    console.error("Error checking role permission:", error);
    return false;
  }
}

/**
 * Require permission untuk module dan action tertentu
 * Menggantikan requirePermission(context, Role.XXX) yang lama
 *
 * @param context - RequestContext dengan roleId
 * @param moduleKey - key dari Module table
 * @param action - action dari Permission table
 * @returns Error object jika denied, null jika allowed
 */
export async function requireModulePermission(
  context: RequestContext,
  moduleKey: string,
  action: string
) {
  // Check jika roleId ada
  if (!context.roleId) {
    return {
      success: false,
      data: null,
      message: "Role ID not found in context",
    };
  }

  // Check permission dari RolePermission table
  const hasPermission = await checkRolePermission(
    context.roleId,
    moduleKey,
    action
  );

  if (!hasPermission) {
    return {
      success: false,
      data: null,
      message: "You are not authorized to access this resource",
    };
  }

  return null;
}

