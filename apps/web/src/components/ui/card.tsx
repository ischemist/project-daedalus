import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { THEME_TOKENS } from "@/lib/theme-tokens"

type CardVariant = "default" | "aegean" | "forge" | "anvil" | "destructive"

const cardVariants = cva(
  "group/card flex flex-col overflow-hidden rounded-xl border-[1.5px] text-sm has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
  {
    variants: {
      variant: {
        default: `${THEME_TOKENS.backgrounds.default} ${THEME_TOKENS.borders.default}`,
        aegean: `${THEME_TOKENS.backgrounds.aegean} ${THEME_TOKENS.borders.aegean}`,
        forge: `${THEME_TOKENS.backgrounds.forge} ${THEME_TOKENS.borders.forge}`,
        anvil: `${THEME_TOKENS.backgrounds.anvil} ${THEME_TOKENS.borders.anvil}`,
        destructive: `${THEME_TOKENS.backgrounds.destructive} ${THEME_TOKENS.borders.destructive}`,
      },
      size: {
        default:
          "gap-4 py-4 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0",
        sm: "gap-3 py-3 has-data-[slot=card-footer]:pb-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const cardHeaderVariants = cva(
  "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4",
  {
    variants: {
      variant: {
        default: THEME_TOKENS.text.default,
        aegean: THEME_TOKENS.text.aegean,
        forge: THEME_TOKENS.text.forge,
        anvil: THEME_TOKENS.text.anvil,
        destructive: THEME_TOKENS.text.destructive,
      },
      size: {
        default:
          "px-4 group-data-[size=sm]/card:px-3 group-data-[size=sm]/card:[.border-b]:pb-3",
        sm: "px-3 [.border-b]:pb-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const cardFooterVariants = cva(
  "flex items-center rounded-b-xl border-t-[1.5px] bg-muted/50",
  {
    variants: {
      variant: {
        default: THEME_TOKENS.text.default,
        aegean: THEME_TOKENS.text.aegean,
        forge: THEME_TOKENS.text.forge,
        anvil: THEME_TOKENS.text.anvil,
        destructive: THEME_TOKENS.text.destructive,
      },
      size: {
        default: "p-4 group-data-[size=sm]/card:p-3",
        sm: "p-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Card({
  className,
  variant,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: CardVariant
  size?: "default" | "sm"
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(cardVariants({ variant, size, className }))}
      {...props}
    />
  )
}

function CardHeader({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: CardVariant
  size?: "default" | "sm"
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(cardHeaderVariants({ variant, size, className }))}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
      {...props}
    />
  )
}

function CardFooter({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: CardVariant
  size?: "default" | "sm"
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn(cardFooterVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
