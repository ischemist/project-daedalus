"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { THEME_TOKENS } from "@/lib/theme-tokens"

type ProgressVariant = "default" | "aegean" | "forge" | "anvil"

const progressTrackVariants = cva(
  "relative flex h-1 w-full items-center overflow-x-hidden rounded-full",
  {
    variants: {
      variant: {
        default: THEME_TOKENS.progressBar.default.track,
        aegean: THEME_TOKENS.progressBar.aegean.track,
        forge: THEME_TOKENS.progressBar.forge.track,
        anvil: THEME_TOKENS.progressBar.anvil.track,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const progressIndicatorColors: Record<ProgressVariant, string> = {
  default: THEME_TOKENS.progressBar.default.indicator,
  aegean: THEME_TOKENS.progressBar.aegean.indicator,
  forge: THEME_TOKENS.progressBar.forge.indicator,
  anvil: THEME_TOKENS.progressBar.anvil.indicator,
}

function Progress({
  className,
  children,
  value,
  ...props
}: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack({
  className,
  variant,
  ...props
}: ProgressPrimitive.Track.Props & {
  variant?: ProgressVariant
}) {
  return (
    <ProgressPrimitive.Track
      className={cn(progressTrackVariants({ variant, className }))}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  variant,
  ...props
}: ProgressPrimitive.Indicator.Props & {
  variant?: ProgressVariant
}) {
  const v = variant ?? "default"
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(
        "h-full transition-all",
        progressIndicatorColors[v],
        className
      )}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
