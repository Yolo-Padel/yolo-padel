import { Role } from "@/types/prisma";

// Frontend RBAC utilities
export interface MenuItem {
  name: string;
  url: string;
  icon: any;
  roles: Role[];
  permissions?: string[]; // Optional: untuk granular permissions
}

// Helper functions untuk frontend RBAC
export const hasRole = (userRole: Role, requiredRoles: Role[]): boolean => {
  return requiredRoles.includes(userRole);
};

// Filter menu items berdasarkan role
export const filterMenuByRole = (menuItems: MenuItem[], userRole: Role): MenuItem[] => {
  return menuItems.filter(item => hasRole(userRole, item.roles));
};

