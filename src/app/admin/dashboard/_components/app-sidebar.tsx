"use client";
//
import * as React from "react";
import {
  Home,
  Users,
  TableCellsMerge,
  LandPlot,
  CalendarDays,
  DollarSign,
  Activity,
  ShieldCheck,
} from "lucide-react";

import { MenuItems } from "@/app/admin/dashboard/_components/menu-items";
import { MenuItemsSkeleton } from "@/app/admin/dashboard/_components/menu-items-skeleton";
import { NavUser } from "@/app/admin/dashboard/_components/nav-user";
import { CompanyProfile } from "@/app/admin/dashboard/_components/company-profile";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { UserType } from "@/types/prisma";
import { MenuItem, filterMenuByAccess } from "@/lib/frontend-rbac";
import { useModules, useRolePermissions } from "@/hooks/use-rbac";

// Menu configuration with userType requirements
const menuConfig: MenuItem[] = [
  {
    name: "Dashboard",
    url: "/admin/dashboard",
    icon: Home,
    userTypes: [UserType.ADMIN, UserType.STAFF],
  },
  {
    name: "Users Management",
    url: "/admin/dashboard/users",
    icon: Users,
    userTypes: [UserType.ADMIN, UserType.STAFF],
    moduleKey: "users",
  },
  {
    name: "Booking List",
    url: "/admin/dashboard/booking",
    icon: LandPlot,
    userTypes: [UserType.ADMIN, UserType.STAFF],
    moduleKey: "bookings",
  },
  {
    name: "Booking Time Table",
    url: "/admin/dashboard/timetable",
    icon: CalendarDays,
    userTypes: [UserType.ADMIN, UserType.STAFF],
    moduleKey: "bookings",
  },
  {
    name: "Custom Price",
    url: "/admin/dashboard/price",
    icon: DollarSign,
    userTypes: [UserType.ADMIN, UserType.STAFF],
    moduleKey: "courts",
  },
  {
    name: "Order List",
    url: "/admin/dashboard/order",
    icon: CalendarDays,
    userTypes: [UserType.ADMIN, UserType.STAFF],
    moduleKey: "orders",
  },
  {
    name: "Venue Management",
    url: "/admin/dashboard/venue",
    icon: TableCellsMerge,
    userTypes: [UserType.ADMIN, UserType.STAFF],
    moduleKey: "venues",
  },
  {
    name: "Activity Log",
    url: "/admin/dashboard/activity-log",
    icon: Activity,
    userTypes: [UserType.ADMIN, UserType.STAFF],
    moduleKey: "logs",
  },
  {
    name: "Access Control",
    url: "/admin/dashboard/access-control",
    icon: ShieldCheck,
    userTypes: [UserType.ADMIN, UserType.STAFF],
    moduleKey: "roles",
  },
];

function UserSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex w-full flex-col gap-1">
        <Skeleton className="w-full h-5" />
        <Skeleton className="w-full h-4" />
      </div>
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, profile, isLoading, isAuthenticated } = useAuth();
  const roleId = user?.roleId ?? "";
  const userType = user?.userType as UserType | undefined;

  const { data: modulesData, isLoading: isModulesLoading } = useModules();

  const { data: rolePermissions, isLoading: isRolePermissionsLoading } =
    useRolePermissions(roleId, Boolean(roleId));

  const moduleKeyMap = React.useMemo(() => {
    if (!modulesData?.modules?.length) {
      return null;
    }

    return modulesData.modules.reduce<Record<string, string>>((acc, module) => {
      acc[module.key] = module.id;
      return acc;
    }, {});
  }, [modulesData]);

  const allowedModuleIds = React.useMemo(() => {
    if (!rolePermissions) {
      return null;
    }

    return new Set(
      rolePermissions
        .filter((permission) => permission.allowed)
        .map((permission) => permission.moduleId)
    );
  }, [rolePermissions]);

  const userData = {
    name: profile?.fullName || "User",
    email: user?.email || "user@example.com",
    avatar: profile?.avatar || "/avatars/shadcn.jpg",
  };

  const filteredMenuItems = userType
    ? filterMenuByAccess({
        menuItems: menuConfig,
        userType,
        moduleKeyMap,
        allowedModuleIds,
      })
    : [];

  const isMenuLoading =
    isLoading || isModulesLoading || isRolePermissionsLoading;

  return (
    <Sidebar collapsible="icon" {...props} className="bg-[#f9fafb]">
      <SidebarHeader className="bg-background">
        <CompanyProfile />
      </SidebarHeader>
      <SidebarContent className="bg-background">
        {isMenuLoading ? (
          <MenuItemsSkeleton />
        ) : (
          <MenuItems menuItems={filteredMenuItems} />
        )}
      </SidebarContent>
      <SidebarFooter className="bg-background">
        {isAuthenticated && !isLoading ? (
          <NavUser user={userData} />
        ) : (
          <UserSkeleton />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
