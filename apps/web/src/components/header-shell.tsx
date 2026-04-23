import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { THEME_TOKENS, type ThemeVariant } from "@/lib/theme-tokens"
import { cn } from "@/lib/utils"

type HeaderShellProps = {
  children: React.ReactNode
  variant?: ThemeVariant
  className?: string
}

export function HeaderShell({
  children,
  variant,
  className,
}: HeaderShellProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 shrink-0 border-b border-border/70 pt-[env(safe-area-inset-top)]",
        variant
          ? "bg-background/80 backdrop-blur-md"
          : "bg-background/85 backdrop-blur",
        variant && THEME_TOKENS.crumbBackgrounds[variant],
        "md:rounded-t-xl",
        className
      )}
    >
      <div className="flex h-16 items-center gap-3 px-4">
        <SidebarTrigger
          className={cn(
            "-ml-1 shrink-0",
            variant && THEME_TOKENS.headerTriggers[variant]
          )}
        />
        <Separator
          orientation="vertical"
          className={cn(
            "mx-2 h-4 shrink-0",
            variant && THEME_TOKENS.headerSeparators[variant]
          )}
        />
        <div className="flex min-w-0 flex-1 items-center">{children}</div>
      </div>
    </header>
  )
}
