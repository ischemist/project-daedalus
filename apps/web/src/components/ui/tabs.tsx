"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { THEME_TOKENS } from "@/lib/theme-tokens"

type TabsTheme = "default" | "aegean" | "forge" | "anvil"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent after:absolute after:right-0 after:bottom-0 after:left-0 after:h-[1px] after:bg-stone-500/20 relative",
        filled: "border-[1.5px] border-stone-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const tabsListLineThemeColors: Record<TabsTheme, string> = {
  default: THEME_TOKENS.tabs.listLine.default,
  aegean: THEME_TOKENS.tabs.listLine.aegean,
  forge: THEME_TOKENS.tabs.listLine.forge,
  anvil: THEME_TOKENS.tabs.listLine.anvil,
}

const tabsListFilledThemeColors: Record<TabsTheme, string> = {
  default: THEME_TOKENS.tabs.listFilled.default,
  aegean: THEME_TOKENS.tabs.listFilled.aegean,
  forge: THEME_TOKENS.tabs.listFilled.forge,
  anvil: THEME_TOKENS.tabs.listFilled.anvil,
}

function TabsList({
  className,
  variant = "default",
  theme,
  ...props
}: TabsPrimitive.List.Props &
  VariantProps<typeof tabsListVariants> & {
    theme?: TabsTheme
  }) {
  const v = variant ?? "default"
  const t = theme ?? "default"
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={v}
      data-theme={t}
      className={cn(
        tabsListVariants({ variant: v }),
        v === "line" && t !== "default" && tabsListLineThemeColors[t],
        v === "filled" && t !== "default" && tabsListFilledThemeColors[t],
        className
      )}
      {...props}
    />
  )
}

// Base trigger styles (no theme color) — matched to design-showcase
const baseTriggerClasses =
  "relative z-10 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border-[1.5px] border-transparent px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

// Theme-specific active/hover colors for triggers
// Tokens now use data-active (Base UI) directly — no runtime .replace() needed
const triggerThemeColors: Record<
  TabsTheme,
  {
    hover: string
    focusRing: string
    lineActive: string
    lineUnderline: string
    filledActive: string
    filledHover: string
    filledText: string
    defaultActive: string
  }
> = {
  default: THEME_TOKENS.tabs.trigger.default,
  aegean: THEME_TOKENS.tabs.trigger.aegean,
  forge: THEME_TOKENS.tabs.trigger.forge,
  anvil: THEME_TOKENS.tabs.trigger.anvil,
}

function TabsTrigger({
  className,
  theme,
  ...props
}: TabsPrimitive.Tab.Props & {
  theme?: TabsTheme
}) {
  const t = theme ?? "default"
  const colors = triggerThemeColors[t]
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        baseTriggerClasses,
        colors.hover,
        colors.focusRing,
        // line variant styles
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        colors.lineActive,
        "group-data-[variant=line]/tabs-list:data-active:after:absolute group-data-[variant=line]/tabs-list:data-active:after:right-0 group-data-[variant=line]/tabs-list:data-active:after:-bottom-1 group-data-[variant=line]/tabs-list:data-active:after:left-0 group-data-[variant=line]/tabs-list:data-active:after:h-0.5 group-data-[variant=line]/tabs-list:data-active:after:rounded-full",
        colors.lineUnderline,
        // filled variant styles
        colors.filledActive,
        colors.filledText,
        colors.filledHover,
        // default (pill) variant styles
        colors.defaultActive,
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
