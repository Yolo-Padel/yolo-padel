"use client";
//
import * as React from "react";
import {
  Home,
  Zap,
  Users,
} from "lucide-react";

import { NavProjects } from "@/app/admin/dashboard/components/nav-projects";
import { NavUser } from "@/app/admin/dashboard/components/nav-user";
import { CompanyProfile } from "@/app/admin/dashboard/components/company-profile";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "../../../../components/ui/skeleton";

// This is sample data.
const data = {
  menuItems: [
    {
      name: "Dashboard",
      url: "/admin/dashboard",
      icon: Home,
    },
    {
      name: "Users",
      url: "/admin/dashboard/users",
      icon: Users,
    },
    { name: "Court",
      url: "/admin/dashboard/court",
      icon: Zap,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, profile, isLoading, isAuthenticated } = useAuth();

  const userData = {
    name: profile?.firstName || profile?.lastName || "User",
    email: user?.email || "user@example.com",
    avatar: profile?.avatar || "/avatars/shadcn.jpg",
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CompanyProfile />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects menuItems={data.menuItems} />
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
