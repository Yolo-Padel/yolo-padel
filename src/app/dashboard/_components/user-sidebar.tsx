"use client";
//
import * as React from "react";
import {
  History,
  LandPlot,
  IdCard,
} from "lucide-react";

import { MenuItems } from "@/app/admin/dashboard/_components/menu-items";
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

// This is sample data.
const data = {
  menuItems: [
    {
      name: "Booking Court",
      url: "/dashboard/booking",
      icon: LandPlot,
    },
    {
      name: "Order History",
      url: "/dashboard/order-history",
      icon: History,
    },
    {
      name: "Membership",
      url: "/dashboard/membership",
      icon: IdCard,
    },
  ],
};

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

export function UserSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, profile, isLoading, isAuthenticated } = useAuth();

  const userData = {
    name: profile?.fullName || "User",
    email: user?.email || "user@example.com",
    avatar: profile?.avatar || "/avatars/shadcn.jpg",
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanyProfile />
      </SidebarHeader>
      <SidebarContent>
        <MenuItems menuItems={data.menuItems} />
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
