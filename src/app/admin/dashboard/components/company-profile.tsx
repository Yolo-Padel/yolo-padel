"use client"

import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function CompanyProfile() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-2 p-2">
          <img src="/yolo-black.png" alt="Company Logo" className="h-7 w-18" />
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
