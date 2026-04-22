"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { appNavItems } from "@/lib/navigation"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"

import { NavUser } from "./nav-user"

type AppSidebarProps = {
  user: {
    name: string | null
    email: string
    image: string | null
  }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        <SidebarGroup className="pt-3">
          <SidebarGroupLabel className="px-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            daedalus
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {appNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      render={<Link href={item.href} />}
                      className="h-10 rounded-xl"
                    >
                      <Icon />
                      <div className="grid text-left">
                        <span>{item.title}</span>
                        <span className="truncate text-[11px] font-normal text-muted-foreground group-data-[collapsible=icon]:hidden">
                          {item.summary}
                        </span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <NavUser {...user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
