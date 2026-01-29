import { UserType } from "@/types/prisma";

// Frontend RBAC utilities
export interface MenuItem {
  name: string;
  url: string;
  icon: any;
  userTypes: UserType[];
  permissions?: string[]; // Optional granular permissions
  moduleKey?: string; // Module key untuk RBAC dinamis (contoh: "users", "bookings")
}

// Helper functions untuk frontend RBAC
export const hasUserType = (
  userType: UserType,
  requiredUserTypes: UserType[]
): boolean => {
  return requiredUserTypes.includes(userType);
};

// Filter menu items berdasarkan userType
export const filterMenuByUserType = (
  menuItems: MenuItem[],
  userType: UserType
): MenuItem[] => {
  return menuItems.filter((item) => hasUserType(userType, item.userTypes));
};

// Filter menu items menggunakan kombinasi userType dan module access
export const filterMenuByAccess = ({
  menuItems,
  userType,
  moduleKeyMap,
  allowedModuleIds,
}: {
  menuItems: MenuItem[];
  userType: UserType;
  moduleKeyMap?: Record<string, string> | null;
  allowedModuleIds?: Set<string> | null;
}): MenuItem[] => {
  return menuItems.filter((item) => {
    // Check if user type matches menu item requirements
    if (!hasUserType(userType, item.userTypes)) {
      return false;
    }

    // ADMIN bypass: Show all menu items that match userType
    // ADMIN users have unrestricted access to all features
    if (userType === UserType.ADMIN) {
      return true;
    }

    // Jika menu tidak terkait module spesifik, cukup cek role
    if (!item.moduleKey) {
      return true;
    }

    // STAFF users: Check module permissions
    // Pastikan data module siap
    if (!moduleKeyMap || !allowedModuleIds) {
      return false;
    }

    const moduleId = moduleKeyMap[item.moduleKey];
    if (!moduleId) {
      return false;
    }

    return allowedModuleIds.has(moduleId);
  });
};
