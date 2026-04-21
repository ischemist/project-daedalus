import * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { THEME_TOKENS } from "@/lib/theme-tokens"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 relative overflow-hidden cursor-pointer",
  {
    variants: {
      variant: {
        plain: '',
        default: THEME_TOKENS.buttons.default,
        outline: THEME_TOKENS.buttons.outline,
        secondary: THEME_TOKENS.buttons.secondary,
        ghost: THEME_TOKENS.buttons.ghost,
        link: THEME_TOKENS.buttons.link,

        aegean: THEME_TOKENS.buttons.aegean,
        aegeanOutline: THEME_TOKENS.buttons.aegeanOutline,
        aegeanGhost: THEME_TOKENS.buttons.aegeanGhost,
        aegeanSolid: THEME_TOKENS.buttons.aegeanSolid,

        forge: THEME_TOKENS.buttons.forge,
        forgeOutline: THEME_TOKENS.buttons.forgeOutline,
        forgeGhost: THEME_TOKENS.buttons.forgeGhost,
        forgeSolid: THEME_TOKENS.buttons.forgeSolid,

        anvil: THEME_TOKENS.buttons.anvil,
        anvilOutline: THEME_TOKENS.buttons.anvilOutline,
        anvilGhost: THEME_TOKENS.buttons.anvilGhost,
        anvilSolid: THEME_TOKENS.buttons.anvilSolid,

        destructive: THEME_TOKENS.buttons.destructive,
        destructiveOutline: THEME_TOKENS.buttons.destructiveOutline,
        destructiveGhost: THEME_TOKENS.buttons.destructiveGhost,
        destructiveSolid: THEME_TOKENS.buttons.destructiveSolid,
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
        titan: "h-12 rounded-lg px-10 py-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  if (asChild) {
    return (
      <span
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        {...(props as React.ComponentProps<"span">)}
      />
    )
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
