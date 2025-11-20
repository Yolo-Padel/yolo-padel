"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function CompanyProfile() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-2 p-2 justify-between w-full">
        <img
          src="/yolo_color.svg"
          alt="Company Logo"
          className="h-12 w-18 group-data-[collapsible=icon]:hidden"
        />
        <SidebarTrigger className="-ml-1" />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
