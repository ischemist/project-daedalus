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
import { useSidebar } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")

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
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              className="rounded-md outline-hidden transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              aria-label={displayName}
            />
          }
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src={image ?? undefined} alt={displayName} />
            <AvatarFallback className="text-xs">{initials || "O"}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent side="top">{displayName}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="end"
        side={isMobile ? "bottom" : "top"}
        sideOffset={8}
        className="min-w-60 rounded-lg"
      >
        <DropdownMenuLabel className="flex items-center gap-3 py-3">
          <Avatar className="h-9 w-9 rounded-lg">
            <AvatarImage src={image ?? undefined} alt={displayName} />
            <AvatarFallback className="rounded-lg">{initials || "O"}</AvatarFallback>
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
  )
}
