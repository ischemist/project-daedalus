"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { THEME_TOKENS } from "@/lib/theme-tokens"

type SwitchVariant = "default" | "aegean" | "forge" | "anvil"

const switchVariants = cva(
  "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50",
  {
    variants: {
      variant: {
        default: THEME_TOKENS.switches.default,
        aegean: THEME_TOKENS.switches.aegean,
        forge: THEME_TOKENS.switches.forge,
        anvil: THEME_TOKENS.switches.anvil,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Switch({
  className,
  size = "default",
  variant,
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
  variant?: SwitchVariant
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(switchVariants({ variant, className }))}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
