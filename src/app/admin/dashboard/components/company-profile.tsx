"use client"

import * as React from "react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function CompanyProfile({
  companyProfile,
}: {
  companyProfile: {
    name: string
    logo: React.ElementType
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-2 p-2">
          <companyProfile.logo className="size-4" />
          <span className="truncate font-medium">{companyProfile.name}</span>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
