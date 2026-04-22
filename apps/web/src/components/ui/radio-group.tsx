"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { THEME_TOKENS } from "@/lib/theme-tokens"

type RadioVariant = "default" | "aegean" | "forge" | "anvil"

const radioItemVariants = cva(
  "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border-[1.5px] outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: THEME_TOKENS.radios.default.item,
        aegean: THEME_TOKENS.radios.aegean.item,
        forge: THEME_TOKENS.radios.forge.item,
        anvil: THEME_TOKENS.radios.anvil.item,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// THEME_TOKENS.radios.*.indicator uses fill-* (for SVG); Base UI uses a <span>,
// so we translate to bg-* equivalents.
const radioIndicatorColors: Record<RadioVariant, string> = {
  default: THEME_TOKENS.radios.default.indicator.replace('fill-', 'bg-'),
  aegean: THEME_TOKENS.radios.aegean.indicator.replace('fill-', 'bg-'),
  forge: THEME_TOKENS.radios.forge.indicator.replace('fill-', 'bg-'),
  anvil: THEME_TOKENS.radios.anvil.indicator.replace('fill-', 'bg-'),
}

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  variant,
  ...props
}: RadioPrimitive.Root.Props & {
  variant?: RadioVariant
}) {
  const v = variant ?? "default"
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(radioItemVariants({ variant: v, className }))}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span className={cn("absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full", radioIndicatorColors[v])} />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
