"use client";
//
import * as React from "react";
import {
  Home,
  Users,
  Crown,
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
import { MenuItem, filterMenuByUserType } from "@/lib/frontend-rbac";

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
  },
  {
    name: "Booking List",
    url: "/admin/dashboard/booking",
    icon: LandPlot,
    userTypes: [UserType.ADMIN, UserType.STAFF],
  },
  {
    name: "Booking Time Table",
    url: "/admin/dashboard/timetable",
    icon: CalendarDays,
    userTypes: [UserType.ADMIN, UserType.STAFF],
  },
  {
    name: "Price Configuration",
    url: "/admin/dashboard/price",
    icon: DollarSign,
    userTypes: [UserType.ADMIN, UserType.STAFF],
  },
  {
    name: "Order List",
    url: "/admin/dashboard/order",
    icon: CalendarDays,
    userTypes: [UserType.ADMIN, UserType.STAFF],
  },
  {
    name: "Venue Management",
    url: "/admin/dashboard/venue",
    icon: TableCellsMerge,
    userTypes: [UserType.ADMIN, UserType.STAFF],
  },
  {
    name: "Activity Log",
    url: "/admin/dashboard/activity-log",
    icon: Activity,
    userTypes: [UserType.ADMIN, UserType.STAFF],
  },
  {
    name: "Access Control",
    url: "/admin/dashboard/access-control",
    icon: ShieldCheck,
    userTypes: [UserType.ADMIN, UserType.STAFF],
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

  // Filter menu items based on user type
  const userType = user?.userType as UserType;
  const filteredMenuItems = userType
    ? filterMenuByUserType(menuConfig, userType)
    : [];

  return (
    <Sidebar collapsible="icon" {...props} className="bg-[#f9fafb]">
      <SidebarHeader className="bg-background">
        <CompanyProfile />
      </SidebarHeader>
      <SidebarContent className="bg-background">
        {isLoading ? (
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
