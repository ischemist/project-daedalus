import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { THEME_TOKENS } from "@/lib/theme-tokens"

type TextareaVariant = "default" | "aegean" | "forge" | "anvil"

const textareaVariants = cva(
  "flex field-sizing-content min-h-16 w-full rounded-lg border-[1.5px] bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: THEME_TOKENS.inputs.default,
        aegean: THEME_TOKENS.inputs.aegean,
        forge: THEME_TOKENS.inputs.forge,
        anvil: THEME_TOKENS.inputs.anvil,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Textarea({
  className,
  variant,
  ...props
}: React.ComponentProps<"textarea"> & {
  variant?: TextareaVariant
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Textarea }
