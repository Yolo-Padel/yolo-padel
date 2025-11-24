import { UserType } from "@/types/prisma";

// Frontend RBAC utilities
export interface MenuItem {
  name: string;
  url: string;
  icon: any;
  userTypes: UserType[];
  permissions?: string[]; // Optional: untuk granular permissions
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
