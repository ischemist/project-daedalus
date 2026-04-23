"use client"

import {
  ArrowRight,
  Check,
  Edit,
  FlaskConical,
  Plus,
  Save,
  Search,
  Send,
  Trash,
  X,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { PAGE_GRADIENT } from "@/lib/theme-tokens"

// ─── family section helper ─────────────────────────────────────

function FamilySection({
  title,
  description,
  headerClass,
  variant,
  outlineVariant,
  ghostVariant,
  solidVariant,
  heroLabel,
  heroIcon: HeroIcon,
  heroSkewClass,
  labels,
}: {
  title: string
  description: string
  headerClass: string
  variant: "aegean" | "forge" | "anvil" | "destructive"
  outlineVariant:
    | "aegeanOutline"
    | "forgeOutline"
    | "anvilOutline"
    | "destructiveOutline"
  ghostVariant: "aegeanGhost" | "forgeGhost" | "anvilGhost" | "destructiveGhost"
  solidVariant: "aegeanSolid" | "forgeSolid" | "anvilSolid" | "destructiveSolid"
  heroLabel: string
  heroIcon: React.ComponentType<{ className?: string }>
  heroSkewClass: string
  labels: {
    primary: [string, string, string]
    outline: string
    ghost: string
    solid: string
  }
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className={`mb-1 text-lg font-semibold ${headerClass}`}>{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* left: primary variants */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            primary variants
          </h3>

          {/* three sizes */}
          <div className="flex flex-wrap items-end gap-3">
            <Button variant={variant} size="sm">
              <Send className="h-3.5 w-3.5" />
              {labels.primary[0]}
            </Button>
            <Button variant={variant} size="default">
              <Send className="h-4 w-4" />
              {labels.primary[1]}
            </Button>
            <Button variant={variant} size="lg">
              <Send className="h-4 w-4" />
              {labels.primary[2]}
            </Button>
          </div>

          {/* animated hero button */}
          <div>
            <Button asChild variant={variant} size="sm">
              <a href="#" className="flex items-center gap-2">
                <span className="relative z-10">{heroLabel}</span>
                <div
                  className={`absolute top-0 -left-16 h-full w-32 skew-x-[20deg] transition-transform duration-700 group-hover:translate-x-52 ${heroSkewClass}`}
                />
                <HeroIcon className="relative z-10 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* right: secondary & UI variants */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
            secondary & UI variants
          </h3>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant={outlineVariant} size="default">
              <Edit className="h-4 w-4" />
              {labels.outline}
            </Button>
            <Button variant={ghostVariant} size="default">
              <Search className="h-4 w-4" />
              {labels.ghost}
            </Button>
            <Button variant={solidVariant} size="default">
              <Check className="h-4 w-4" />
              {labels.solid}
            </Button>
          </div>

          {/* icon-only variants */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant={variant} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant={outlineVariant} size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant={ghostVariant} size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant={solidVariant} size="icon">
              <Check className="h-4 w-4" />
            </Button>
            <Button variant={variant} size="icon-sm">
              <Zap className="h-3.5 w-3.5" />
            </Button>
            <Button variant={variant} size="icon-xs">
              <FlaskConical className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── buttons section ───────────────────────────────────────────

export function ButtonsSection() {
  return (
    <div className={`${PAGE_GRADIENT} py-12`}>
      <div className="mx-auto max-w-5xl space-y-12 px-6">
        {/* header */}
        <div>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">
            button design system
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            three themed button families plus destructive and neutral utility
            variants. family names map to semantic roles in the retrosynthesis
            platform — <em>aegean</em> for platform identity, <em>forge</em> for
            work-enqueuing actions, <em>anvil</em> for infrastructure chrome.
            each family provides a gradient primary, outline, ghost, and solid
            sub-variant.
          </p>
        </div>

        {/* ═══ aegean family ═══ */}
        <FamilySection
          title="aegean family"
          description="teal 800/500. platform identity, navigation, and surfaces. task overview, route browsing, model selection. lives on dashboards, sidebars, and any surface whose main purpose is exploration."
          headerClass="text-teal-800 dark:text-teal-500"
          variant="aegean"
          outlineVariant="aegeanOutline"
          ghostVariant="aegeanGhost"
          solidVariant="aegeanSolid"
          heroLabel="Explore Routes"
          heroIcon={FlaskConical}
          heroSkewClass="bg-teal-200/20 dark:bg-white/20"
          labels={{
            primary: ["View Task", "Browse Routes", "Open Dashboard"],
            outline: "Filter Models",
            ghost: "Search InChIKeys",
            solid: "Select Route",
          }}
        />

        {/* ═══ forge family ═══ */}
        <FamilySection
          title="forge family"
          description="amber 800/500. actions that enqueue work — submit a retrosynthesis task, execute a planning run, queue a batch. lives on /submit and any surface whose main purpose is to kick off execution."
          headerClass="text-amber-800 dark:text-amber-500"
          variant="forge"
          outlineVariant="forgeOutline"
          ghostVariant="forgeGhost"
          solidVariant="forgeSolid"
          heroLabel="Submit Batch"
          heroIcon={Zap}
          heroSkewClass="bg-amber-200/20 dark:bg-white/20"
          labels={{
            primary: ["Queue Job", "Submit Batch", "Execute Plan"],
            outline: "Edit SMILES",
            ghost: "Preview Queue",
            solid: "Confirm Run",
          }}
        />

        {/* ═══ anvil family ═══ */}
        <FamilySection
          title="anvil family"
          description="slate 700/400. infrastructure, administration, system management — worker lifecycle, runtime config, scaling, logs. lives on /admin, /workers, /runtimes, and /settings. deliberately unglamorous plumbing surfaces."
          headerClass="text-slate-700 dark:text-slate-400"
          variant="anvil"
          outlineVariant="anvilOutline"
          ghostVariant="anvilGhost"
          solidVariant="anvilSolid"
          heroLabel="Deploy Worker"
          heroIcon={ArrowRight}
          heroSkewClass="bg-slate-200/20 dark:bg-white/20"
          labels={{
            primary: ["Add Runtime", "Deploy Worker", "Scale Cluster"],
            outline: "Edit Config",
            ghost: "View Logs",
            solid: "Apply Settings",
          }}
        />

        {/* ═══ destructive family ═══ */}
        <FamilySection
          title="destructive family"
          description="warning rose/red. cancellations, deletions, and any action that cannot be undone — always overrides the surrounding page variant. lives on confirmation dialogs, delete buttons, and destructive menu items."
          headerClass="text-rose-700 dark:text-rose-400"
          variant="destructive"
          outlineVariant="destructiveOutline"
          ghostVariant="destructiveGhost"
          solidVariant="destructiveSolid"
          heroLabel="Purge Results"
          heroIcon={Trash}
          heroSkewClass="bg-rose-200/20 dark:bg-white/20"
          labels={{
            primary: ["Cancel Task", "Delete Batch", "Purge Results"],
            outline: "Remove Route",
            ghost: "Dismiss",
            solid: "Confirm Delete",
          }}
        />

        {/* ═══ UI utility buttons ═══ */}
        <section className="space-y-4">
          <div>
            <h2 className="mb-1 text-lg font-semibold">UI utility buttons</h2>
            <p className="text-sm text-muted-foreground">
              neutral variants for standard UI actions — no domain color signal.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* left: standard variants */}
            <div className="space-y-4">
              <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                standard variants
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default">
                  <Check className="h-4 w-4" />
                  Default
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4" />
                  Outline
                </Button>
                <Button variant="ghost">
                  <Search className="h-4 w-4" />
                  Ghost
                </Button>
                <Button variant="secondary">
                  <Save className="h-4 w-4" />
                  Secondary
                </Button>
                <Button variant="link">
                  <ArrowRight className="h-4 w-4" />
                  Link
                </Button>
              </div>
            </div>

            {/* right: icon-only variants */}
            <div className="space-y-4">
              <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                icon-only variants
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="default" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="secondary" size="icon">
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* all icon sizes */}
              <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                icon sizes
              </h3>
              <div className="flex flex-wrap items-end gap-2">
                <Button variant="default" size="icon-xs">
                  <Plus className="h-3 w-3" />
                </Button>
                <Button variant="default" size="icon-sm">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <Button variant="default" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon-lg">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* full size range */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              size scale
            </h3>
            <div className="flex flex-wrap items-end gap-3">
              <Button variant="default" size="xs">
                <FlaskConical className="h-3 w-3" />
                xs
              </Button>
              <Button variant="default" size="sm">
                <FlaskConical className="h-3.5 w-3.5" />
                sm
              </Button>
              <Button variant="default" size="default">
                <FlaskConical className="h-4 w-4" />
                default
              </Button>
              <Button variant="default" size="lg">
                <FlaskConical className="h-4 w-4" />
                lg
              </Button>
              <Button variant="default" size="titan">
                <FlaskConical className="h-5 w-5" />
                titan
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
