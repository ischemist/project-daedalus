"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOutIcon, ShieldCheckIcon } from "lucide-react"

import { authClient } from "@/lib/auth/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

type NavUserProps = {
  name: string | null
  email: string
  image: string | null
}

export function NavUser({ name, email, image }: NavUserProps) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  const [lastMethod] = useState<string | null>(() =>
    typeof document === "undefined" ? null : authClient.getLastUsedLoginMethod(),
  )

  const displayName = name ?? "operator"

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/signin")
          router.refresh()
        },
      },
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent" />}
          >
            <Avatar className="h-8 w-8 rounded-xl">
              <AvatarImage src={image ?? undefined} alt={displayName} />
              <AvatarFallback className="rounded-xl">{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground">{email}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side={isMobile ? "bottom" : "right"}
            sideOffset={8}
            className="w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-2xl"
          >
            <DropdownMenuLabel className="flex items-center gap-3 py-3">
              <Avatar className="h-9 w-9 rounded-xl">
                <AvatarImage src={image ?? undefined} alt={displayName} />
                <AvatarFallback className="rounded-xl">{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="grid text-left">
                <span className="font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">{email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <ShieldCheckIcon className="mr-2 h-4 w-4" />
              {lastMethod ? `last sign-in: ${lastMethod.replaceAll("-", " ")}` : "passwordless auth session"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
