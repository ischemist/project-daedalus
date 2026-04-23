"use client"

import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { appNavItems } from "@/lib/navigation"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"

import { ModeToggle } from "./mode-toggle"
import { NavUser } from "./nav-user"

type AppSidebarProps = {
  user: {
    name: string | null
    email: string
    image: string | null
  }
  children?: React.ReactNode
  footerMeta?: React.ReactNode
}

export function AppSidebar({ user, children, footerMeta }: AppSidebarProps) {
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
                      className="h-9 hover:bg-teal-700/8 hover:text-teal-800 dark:hover:bg-teal-700/15 dark:hover:text-teal-500 data-active:bg-teal-700/8 data-active:text-teal-800 dark:data-active:bg-teal-700/15 dark:data-active:text-teal-500"
                    >
                      <Icon />
                      <span className="capitalize">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {children}
      </SidebarContent>
      <SidebarFooter className="flex-row items-center justify-between p-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:p-1">
        <ModeToggle />
        {footerMeta}
        <NavUser {...user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function SidebarFooterMeta({
  version,
  versionDate,
}: {
  version: string | null
  versionDate: string | null
}) {
  if (!version) {
    return null
  }

  return (
    <Link
      href="/changelog"
      className="flex flex-col items-center leading-tight text-muted-foreground transition-colors hover:text-foreground group-data-[collapsible=icon]:hidden"
      aria-label="view changelog"
    >
      <span className="text-xs font-medium">v{version}</span>
      {versionDate ? (
        <span className="text-[10px] text-muted-foreground/70">
          {formatDistanceToNow(new Date(versionDate), { addSuffix: true })}
        </span>
      ) : null}
    </Link>
  )
}
