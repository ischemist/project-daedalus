import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type HeaderShellProps = {
  children: React.ReactNode
  className?: string
}

export function HeaderShell({ children, className }: HeaderShellProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 shrink-0 border-b border-border/70 bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur",
        "md:rounded-t-3xl",
        className
      )}
    >
      <div className="flex h-16 items-center gap-3 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <div className="flex min-w-0 flex-1 items-center">{children}</div>
      </div>
    </header>
  )
}
