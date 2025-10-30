"use client";
//
import * as React from "react";
import {
  Home,
  Users,
  Crown,
  TableCellsMerge,
  LandPlot,
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
import { Role } from "@/types/prisma";
import { MenuItem, filterMenuByRole } from "@/lib/frontend-rbac";

// Menu configuration dengan role requirements
const menuConfig: MenuItem[] = [
  {
    name: "Dashboard",
    url: "/admin/dashboard",
    icon: Home,
    roles: [Role.FINANCE, Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    name: "Users Management",
    url: "/admin/dashboard/users",
    icon: Users,
    roles: [Role.SUPER_ADMIN],
  },
  {
    name: "Booking Management",
    url: "/admin/dashboard/booking",
    icon: LandPlot,
    roles: [Role.FINANCE, Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    name: "Venue Management",
    url: "/admin/dashboard/venue",
    icon: TableCellsMerge,
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    name: "Membership",
    url: "/admin/dashboard/membership",
    icon: Crown,
    roles: [Role.FINANCE, Role.ADMIN, Role.SUPER_ADMIN], // Semua role bisa akses
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

  const userData = {
    name: profile?.fullName || "User",
    email: user?.email || "user@example.com",
    avatar: profile?.avatar || "/avatars/shadcn.jpg",
  };

  // Filter menu items berdasarkan role user
  const userRole = user?.role as Role;
  const filteredMenuItems = userRole ? filterMenuByRole(menuConfig, userRole) : [];

  return (
    <Sidebar collapsible="icon" {...props} className="bg-[#f9fafb]">
      <SidebarHeader className="bg-white">
        <CompanyProfile />
      </SidebarHeader>
      <SidebarContent className="bg-white">
        {isLoading ? (
          <MenuItemsSkeleton />
        ) : (
          <MenuItems menuItems={filteredMenuItems} />
        )}
      </SidebarContent>
      <SidebarFooter>
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
