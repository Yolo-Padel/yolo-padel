"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  type LucideIcon,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function MenuItems({
  menuItems,
}: {
  menuItems: {
    name: string  
    url: string
    icon: LucideIcon
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]">
      <SidebarMenu>
        {menuItems.map((item) => {
          const isActive = pathname === item.url
          
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild 
                isActive={isActive}
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
