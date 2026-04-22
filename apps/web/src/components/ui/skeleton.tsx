import { cn } from "@/lib/utils"
import { THEME_TOKENS } from "@/lib/theme-tokens"

type SkeletonVariant = "default" | "aegean" | "forge" | "anvil"

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: SkeletonVariant
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md",
        THEME_TOKENS.skeletons[variant],
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
