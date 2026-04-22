"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ButtonsSection } from "./buttons-section"
import { InteractionSection } from "./interaction-section"

// ─── showcase ────────────────────────────────────────────────────

export function ShowcasePage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background">
      {/* ─── top bar ─── */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-6 py-3">
        <h1 className="text-lg font-semibold tracking-tight">
          daedalus design language
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            aegean &middot; forge &middot; anvil
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="size-4 dark:hidden" />
            <Moon className="hidden size-4 dark:block" />
          </Button>
        </div>
      </div>

      {/* ─── description ─── */}
      <div className="border-b border-border px-6 py-3">
        <p className="text-sm text-muted-foreground">
          theme-token based design system for the ischemist retrosynthesis
          ecosystem. three semantic variant families, each with
          gradient/outline/ghost/solid button styles and consistent component
          theming. plus default and destructive structural variants.
        </p>
      </div>

      {/* ─── all sections ─── */}
      <div className="space-y-16">
        <ButtonsSection />
        <InteractionSection />
      </div>
    </div>
  )
}
