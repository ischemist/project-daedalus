"use client"

import React, { useState } from "react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  PAGE_GRADIENT,
  THEME_TOKENS,
  type ColorFamily,
  text,
  borders,
  backgrounds,
  rings,
  progress as progressTokens,
  controls,
} from "@/lib/theme-tokens"

import {
  AlertTriangle,
  ArrowRightCircle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cog,
  FlaskConical,
  GitBranch,
  Info,
  Keyboard,
  ListTodo,
  Loader2,
  Mail,
  MessageSquare,
  Search,
  Send,
  Settings,
  Slash,
  Sparkles,
  TestTube,
  User,
  UserPlus,
  XCircle,
  Zap,
  Server,
} from "lucide-react"

// ─── constants ─────────────────────────────────────────────────

const FAMILIES: {
  key: ColorFamily
  label: string
  headerClass: string
}[] = [
  { key: "aegean", label: "aegean", headerClass: "text-teal-800 dark:text-teal-500" },
  { key: "forge", label: "forge", headerClass: "text-amber-800 dark:text-amber-500" },
  { key: "anvil", label: "anvil", headerClass: "text-slate-700 dark:text-slate-400" },
]

type PopoverDatePickerProps = {
  id?: string
  variant: ColorFamily
  value?: Date
  placeholder?: string
  buttonClassName?: string
  onSelect: (date: Date | undefined) => void
}

function PopoverDatePicker({
  id,
  variant,
  value,
  placeholder = "pick a date",
  buttonClassName,
  onSelect,
}: PopoverDatePickerProps) {
  const [open, setOpen] = useState(false)
  const buttonVariant =
    `${variant}Outline` as React.ComponentProps<typeof Button>["variant"]

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant={buttonVariant}
              className={cn(
                "w-full justify-between font-normal",
                buttonClassName
              )}
            />
          }
        >
          {value ? value.toLocaleDateString() : placeholder}
          <ChevronDown className="size-4 opacity-70" />
        </PopoverTrigger>
        <PopoverContent
          variant={variant}
          className="w-auto overflow-hidden p-0"
          align="start"
        >
          <Calendar
            variant={variant}
            mode="single"
            selected={value}
            onSelect={(date) => {
              onSelect(date)
              if (date) setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ─── task status badges ───────────────────────────────────────

type TaskStatus =
  | "queued"
  | "leased"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "expired"

type StatusDef = {
  label: TaskStatus
  shortCode: string
  icon: React.ComponentType<{ className?: string }>
  iconClass?: string
  fillBg: string
  fillText: string
  fillIcon: string
  neutralIcon: string
  borderColor: string
  borderText: string
  borderIcon: string
}

const STATUS_DEFS: StatusDef[] = [
  {
    label: "queued",
    shortCode: "QUE",
    icon: Clock,
    fillBg: "bg-zinc-100 dark:bg-zinc-800",
    fillText: "text-zinc-600 dark:text-zinc-400",
    fillIcon: "text-zinc-500 dark:text-zinc-400",
    neutralIcon: "text-zinc-500 dark:text-zinc-400",
    borderColor: "border-zinc-400 dark:border-zinc-600",
    borderText: "text-zinc-600 dark:text-zinc-400",
    borderIcon: "text-zinc-500 dark:text-zinc-400",
  },
  {
    label: "leased",
    shortCode: "LSE",
    icon: ArrowRightCircle,
    fillBg: "bg-amber-400/15 dark:bg-amber-400/20",
    fillText: "text-amber-600 dark:text-amber-300",
    fillIcon: "text-amber-500 dark:text-amber-300",
    neutralIcon: "text-amber-500 dark:text-amber-300",
    borderColor: "border-amber-400 dark:border-amber-400/60",
    borderText: "text-amber-600 dark:text-amber-300",
    borderIcon: "text-amber-500 dark:text-amber-300",
  },
  {
    label: "running",
    shortCode: "RUN",
    icon: Loader2,
    iconClass: "animate-spin",
    fillBg: "bg-amber-500/15 dark:bg-amber-500/20",
    fillText: "text-amber-700 dark:text-amber-400",
    fillIcon: "text-amber-600 dark:text-amber-400",
    neutralIcon: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-500 dark:border-amber-500/60",
    borderText: "text-amber-700 dark:text-amber-400",
    borderIcon: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "succeeded",
    shortCode: "SUCC",
    icon: CheckCircle2,
    fillBg: "bg-amber-700/15 dark:bg-amber-700/20",
    fillText: "text-amber-800 dark:text-amber-500",
    fillIcon: "text-amber-700 dark:text-amber-500",
    neutralIcon: "text-amber-700 dark:text-amber-500",
    borderColor: "border-amber-700 dark:border-amber-700/60",
    borderText: "text-amber-800 dark:text-amber-500",
    borderIcon: "text-amber-700 dark:text-amber-500",
  },
  {
    label: "failed",
    shortCode: "FAIL",
    icon: XCircle,
    fillBg: "bg-rose-500/15 dark:bg-rose-500/20",
    fillText: "text-rose-700 dark:text-rose-400",
    fillIcon: "text-rose-600 dark:text-rose-400",
    neutralIcon: "text-rose-600 dark:text-rose-400",
    borderColor: "border-rose-500 dark:border-rose-500/60",
    borderText: "text-rose-700 dark:text-rose-400",
    borderIcon: "text-rose-600 dark:text-rose-400",
  },
  {
    label: "cancelled",
    shortCode: "CXL",
    icon: Slash,
    fillBg: "bg-zinc-100 dark:bg-zinc-800",
    fillText: "text-zinc-500 dark:text-zinc-500",
    fillIcon: "text-zinc-400 dark:text-zinc-500",
    neutralIcon: "text-zinc-400 dark:text-zinc-500",
    borderColor: "border-zinc-400 dark:border-zinc-600",
    borderText: "text-zinc-500 dark:text-zinc-500",
    borderIcon: "text-zinc-400 dark:text-zinc-500",
  },
  {
    label: "expired",
    shortCode: "EXP",
    icon: AlertTriangle,
    fillBg: "bg-amber-500/10 dark:bg-amber-500/15",
    fillText: "text-amber-600 dark:text-amber-400",
    fillIcon: "text-amber-500 dark:text-amber-400",
    neutralIcon: "text-amber-500 dark:text-amber-400",
    borderColor: "border-amber-500/50 dark:border-amber-500/40",
    borderText: "text-amber-600 dark:text-amber-400",
    borderIcon: "text-amber-500 dark:text-amber-400",
  },
]

function FilledBadge({ def, density }: { def: StatusDef; density: "full" | "compact" | "icon" }) {
  const Icon = def.icon
  return (
    <Badge
      variant="secondary"
      className={`gap-1.5 border-transparent ${def.fillBg} ${def.fillText}`}
    >
      <Icon className={`size-3 ${def.fillIcon} ${def.iconClass ?? ""}`} />
      {density === "full" && def.label}
      {density === "compact" && def.shortCode}
    </Badge>
  )
}

function NeutralBadge({ def, density }: { def: StatusDef; density: "full" | "compact" | "icon" }) {
  const Icon = def.icon
  return (
    <Badge
      variant="secondary"
      className="gap-1.5 border-transparent bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
    >
      <Icon className={`size-3 ${def.neutralIcon} ${def.iconClass ?? ""}`} />
      {density === "full" && def.label}
      {density === "compact" && def.shortCode}
    </Badge>
  )
}

function BorderBadge({ def, density }: { def: StatusDef; density: "full" | "compact" | "icon" }) {
  const Icon = def.icon
  return (
    <Badge
      variant="outline"
      className={`gap-1.5 bg-transparent ${def.borderColor} ${def.borderText}`}
    >
      <Icon className={`size-3 ${def.borderIcon} ${def.iconClass ?? ""}`} />
      {density === "full" && def.label}
      {density === "compact" && def.shortCode}
    </Badge>
  )
}

const MOCK_TASKS: {
  smiles: string
  model: string
  status: TaskStatus
  time: string
}[] = [
  { smiles: "CC(=O)Oc1ccccc1C(=O)O", model: "ariadne", status: "succeeded", time: "42.3s" },
  { smiles: "c1ccc2c(c1)cc1ccc3cccc4ccc2c1c34", model: "ariadne", status: "running", time: "\u2014" },
  { smiles: "CC(C)Cc1ccc(C(C)C(=O)O)cc1", model: "retro*", status: "queued", time: "\u2014" },
  { smiles: "OC(=O)c1ccccc1O", model: "synplanner", status: "failed", time: "12.1s" },
  { smiles: "CC(=O)NC1CCC(O)CC1", model: "ariadne", status: "leased", time: "\u2014" },
  { smiles: "c1ccncc1", model: "retro*", status: "cancelled", time: "\u2014" },
  { smiles: "CC(O)C(=O)O", model: "synplanner", status: "expired", time: "300.0s" },
]

const MOLECULE_STATES = [
  {
    label: "in-stock",
    badge: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  },
  {
    label: "default",
    badge: "bg-gray-500/15 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
  },
  {
    label: "match",
    badge: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  },
  {
    label: "extension",
    badge: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  },
  {
    label: "ghost",
    badge: "bg-gray-500/10 text-gray-500 dark:bg-gray-500/15 dark:text-gray-400 border-dashed border-gray-400",
  },
]


// ─── interaction section ───────────────────────────────────────

export function InteractionSection() {
  const [showStatusBar, setShowStatusBar] = useState(true)
  const [showPanel, setShowPanel] = useState(false)
  const [dropdownRadio, setDropdownRadio] = useState("system")
  const [sliderValues, setSliderValues] = useState<Record<ColorFamily, number[]>>({
    aegean: [65],
    forge: [42],
    anvil: [80],
  })
  const [popoverDates, setPopoverDates] = useState<Record<ColorFamily, Date | undefined>>({
    aegean: undefined,
    forge: undefined,
    anvil: undefined,
  })
  const [inlineDates, setInlineDates] = useState<Record<ColorFamily, Date | undefined>>({
    aegean: undefined,
    forge: undefined,
    anvil: undefined,
  })
  const [ranges, setRanges] = useState<Record<ColorFamily, DateRange | undefined>>({
    aegean: undefined,
    forge: undefined,
    anvil: undefined,
  })
  const [formDates, setFormDates] = useState<Record<string, Date | undefined>>({
    start: undefined,
    end: undefined,
    deadline: undefined,
  })

  return (
    <div className={`${PAGE_GRADIENT} py-12`}>
      <div className="mx-auto max-w-5xl space-y-12 px-6">
        <div>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight">
            interaction components
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            cards, inputs, textareas, checkboxes, switches, radio groups,
            progress bars, sliders, and tabs — each shown with themed variants
            for aegean, forge, and anvil.
          </p>
        </div>

        {/* ── 1. cards ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Cards</h2>
          <p className="text-sm text-muted-foreground">
            Default plus three family-themed cards with chemistry-domain content.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {/* default card */}
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>
                  Standard card with no color overrides applied.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Neutral styling inherited from the theme. Good for secondary
                  or informational content across the platform.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm">
                  Cancel
                </Button>
                <Button size="sm">Submit</Button>
              </CardFooter>
            </Card>

            {/* aegean card */}
            <Card className={cn("border", borders.aegean)}>
              <CardHeader>
                <CardTitle className={text.aegean}>
                  <span className="flex items-center gap-2">
                    <FlaskConical className="size-4" />
                    Route Analysis
                  </span>
                </CardTitle>
                <CardDescription>
                  Analyzing retrosynthetic routes for CC(=O)Oc1ccccc1C(=O)O
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Aegean-themed card for platform identity surfaces. Teal borders
                  and header text signal exploration context.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="aegeanOutline" size="sm">
                  Dismiss
                </Button>
                <Button variant="aegeanSolid" size="sm">
                  <Search className="size-4" />
                  Browse
                </Button>
              </CardFooter>
            </Card>

            {/* forge card */}
            <Card className={cn("border", borders.forge)}>
              <CardHeader>
                <CardTitle className={text.forge}>
                  <span className="flex items-center gap-2">
                    <Zap className="size-4" />
                    Submission #1284
                  </span>
                </CardTitle>
                <CardDescription>
                  New retrosynthesis task queued via ariadne runtime.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Forge-themed card for action and submission flows. Amber
                  borders and header text signal an active task.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="forgeOutline" size="sm">
                  Cancel
                </Button>
                <Button variant="forgeSolid" size="sm">
                  <Send className="size-4" />
                  Submit
                </Button>
              </CardFooter>
            </Card>

            {/* anvil card */}
            <Card className={cn("border", borders.anvil)}>
              <CardHeader>
                <CardTitle className={text.anvil}>
                  <span className="flex items-center gap-2">
                    <Server className="size-4" />
                    Runtime Config
                  </span>
                </CardTitle>
                <CardDescription>
                  runtime-ariadne v0.3.1 &middot; GPU: A100 40GB &middot; 4
                  workers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Anvil-themed card for infrastructure management. Slate borders
                  and header text mark admin surfaces.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="anvilOutline" size="sm">
                  Export
                </Button>
                <Button variant="anvilSolid" size="sm">
                  <Sparkles className="size-4" />
                  Manage
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* ── 2. inputs ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Inputs</h2>
          <p className="text-sm text-muted-foreground">
            Themed text inputs — one per family with chemistry-domain
            placeholders.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label className={text.aegean}>Target SMILES</Label>
              <Input
                placeholder="CC(=O)Oc1ccccc1C(=O)O"
                className={cn(
                  "font-mono",
                  THEME_TOKENS.inputs.aegean
                )}
              />
            </div>
            <div className="space-y-2">
              <Label className={text.forge}>Batch Name</Label>
              <Input
                placeholder="aspirin-retro-batch-001"
                className={THEME_TOKENS.inputs.forge}
              />
            </div>
            <div className="space-y-2">
              <Label className={text.anvil}>Runtime Endpoint</Label>
              <Input
                placeholder="http://localhost:8421"
                className={cn("font-mono", THEME_TOKENS.inputs.anvil)}
              />
            </div>
          </div>
        </section>

        {/* ── 3. textareas ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Textareas</h2>
          <p className="text-sm text-muted-foreground">
            Multi-line themed textareas for longer input.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label className={text.aegean}>Route Notes</Label>
              <Textarea
                placeholder="3 viable routes found via retrostar. best route uses Suzuki coupling as key step..."
                className={THEME_TOKENS.inputs.aegean}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className={text.forge}>Task Description</Label>
              <Textarea
                placeholder="retrosynthesis of ibuprofen using ariadne with beam_size=50, max_depth=10..."
                className={THEME_TOKENS.inputs.forge}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label className={text.anvil}>Worker Config YAML</Label>
              <Textarea
                placeholder="concurrency: 4&#10;gpu_memory: 40GB&#10;timeout_s: 300"
                className={cn("font-mono", THEME_TOKENS.inputs.anvil)}
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* ── 4. checkboxes ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Checkboxes</h2>
          <p className="text-sm text-muted-foreground">
            Themed checkboxes in checked and unchecked states.
          </p>
          <div className="flex flex-wrap gap-8">
            {FAMILIES.map(({ key, label }) => (
              <div key={key} className="space-y-3">
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    text[key]
                  )}
                >
                  {label}
                </span>
                <div className="flex items-center gap-3">
                  <Checkbox
                    defaultChecked
                    variant={key}
                  />
                  <Label className={cn("text-sm", text[key])}>
                    Include stereochemistry
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox
                    variant={key}
                  />
                  <Label className="text-sm">Use retro* scoring</Label>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. switches ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Switches</h2>
          <p className="text-sm text-muted-foreground">
            Themed toggle switches for boolean settings.
          </p>
          <div className="flex flex-wrap gap-8">
            {FAMILIES.map(({ key, label }) => (
              <div key={key} className="space-y-3">
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    text[key]
                  )}
                >
                  {label}
                </span>
                <div className="flex items-center gap-3">
                  <Switch
                    defaultChecked
                    variant={key}
                  />
                  <Label className={cn("text-sm", text[key])}>
                    Parallel execution
                  </Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch variant={key} />
                  <Label className="text-sm">GPU acceleration</Label>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. radio groups ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Radio Groups</h2>
          <p className="text-sm text-muted-foreground">
            Themed radio groups for single-select choices.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {FAMILIES.map(({ key, label }) => (
              <div key={key} className="space-y-3">
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    text[key]
                  )}
                >
                  {label}
                </span>
                <RadioGroup defaultValue="option-1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="option-1"
                      variant={key}
                    />
                    <Label className="text-sm">ariadne</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="option-2"
                      variant={key}
                    />
                    <Label className="text-sm">retrostar</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="option-3"
                      variant={key}
                      disabled
                    />
                    <Label className="text-sm text-muted-foreground">
                      synplanner (coming soon)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        </section>

        {/* ── 7. progress bars ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Progress Bars</h2>
          <p className="text-sm text-muted-foreground">
            Themed progress indicators — one per family.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {FAMILIES.map(({ key, label }) => {
              const val = key === "aegean" ? 72 : key === "forge" ? 45 : 91
              const taskLabel =
                key === "aegean"
                  ? "route search"
                  : key === "forge"
                    ? "batch execution"
                    : "worker deployment"
              return (
                <div key={key} className="space-y-2">
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      text[key]
                    )}
                  >
                    {label}
                  </span>
                  <Progress value={val}>
                    <ProgressLabel className={cn(text[key])}>
                      {taskLabel}
                    </ProgressLabel>
                    <ProgressValue />
                    <ProgressTrack
                      className={THEME_TOKENS.progressBar[key].track}
                    >
                      <ProgressIndicator
                        className={
                          THEME_TOKENS.progressBar[key].indicator
                        }
                      />
                    </ProgressTrack>
                  </Progress>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── 8. sliders ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Sliders</h2>
          <p className="text-sm text-muted-foreground">
            Themed range sliders — one per family.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {FAMILIES.map(({ key, label }) => {
              const paramLabel =
                key === "aegean"
                  ? "beam_size"
                  : key === "forge"
                    ? "max_depth"
                    : "concurrency"
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className={cn("text-sm", text[key])}>
                      {paramLabel}
                    </Label>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {sliderValues[key][0]}
                    </span>
                  </div>
                  <Slider
                    value={sliderValues[key]}
                    onValueChange={(v) =>
                      setSliderValues((prev) => ({
                        ...prev,
                        [key]: Array.isArray(v) ? v : [v],
                      }))
                    }
                    max={100}
                    className={cn(
                      "[&_[data-slot=slider-range]]:bg-current",
                      "[&_[data-slot=slider-track]]:bg-current/20",
                      text[key]
                    )}
                  />
                </div>
              )
            })}
          </div>
        </section>

        {/* ── 9. tabs ── */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Tabs</h2>
          <p className="text-sm text-muted-foreground">
            Three tab styles (default, line, filled) shown for each family.
          </p>

          {/* default tabs */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              default style
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {FAMILIES.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      text[key]
                    )}
                  >
                    {label}
                  </span>
                  <Tabs defaultValue="tab-1">
                    <TabsList theme={key}>
                      <TabsTrigger theme={key} value="tab-1">routes</TabsTrigger>
                      <TabsTrigger theme={key} value="tab-2">metrics</TabsTrigger>
                      <TabsTrigger theme={key} value="tab-3">logs</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab-1">
                      <p className="pt-2 text-sm text-muted-foreground">
                        3 synthetic routes found via ariadne
                      </p>
                    </TabsContent>
                    <TabsContent value="tab-2">
                      <p className="pt-2 text-sm text-muted-foreground">
                        avg latency: 2.1s per molecule
                      </p>
                    </TabsContent>
                    <TabsContent value="tab-3">
                      <p className="pt-2 text-sm text-muted-foreground">
                        tail -f runtime-ariadne.log
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
              ))}
            </div>
          </div>

          {/* line tabs */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              line style
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {FAMILIES.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      text[key]
                    )}
                  >
                    {label}
                  </span>
                  <Tabs defaultValue="tab-1">
                    <TabsList variant="line" theme={key}>
                      <TabsTrigger theme={key} value="tab-1">SMILES</TabsTrigger>
                      <TabsTrigger theme={key} value="tab-2">InChIKey</TabsTrigger>
                      <TabsTrigger theme={key} value="tab-3">tree</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab-1">
                      <p className="pt-2 text-sm font-mono text-muted-foreground">
                        CC(=O)Oc1ccccc1C(=O)O
                      </p>
                    </TabsContent>
                    <TabsContent value="tab-2">
                      <p className="pt-2 text-sm font-mono text-muted-foreground">
                        BSYNRYMUTXBXSQ-UHFFFAOYSA-N
                      </p>
                    </TabsContent>
                    <TabsContent value="tab-3">
                      <p className="pt-2 text-sm text-muted-foreground">
                        depth-first route tree visualization
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
              ))}
            </div>
          </div>

          {/* filled tabs */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              filled style
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              {FAMILIES.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <span
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      text[key]
                    )}
                  >
                    {label}
                  </span>
                  <Tabs defaultValue="tab-1">
                    <TabsList variant="filled" theme={key}>
                      <TabsTrigger theme={key} value="tab-1">pending</TabsTrigger>
                      <TabsTrigger theme={key} value="tab-2">running</TabsTrigger>
                      <TabsTrigger theme={key} value="tab-3">completed</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab-1">
                      <p className="pt-2 text-sm text-muted-foreground">
                        12 tasks waiting in fairness queue
                      </p>
                    </TabsContent>
                    <TabsContent value="tab-2">
                      <p className="pt-2 text-sm text-muted-foreground">
                        3 tasks executing on runtime-ariadne
                      </p>
                    </TabsContent>
                    <TabsContent value="tab-3">
                      <p className="pt-2 text-sm text-muted-foreground">
                        847 tasks completed this session
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 10. badges ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Badges</h2>
          <p className="text-sm text-muted-foreground">
            Themed badges in solid and outline styles for status indicators.
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge variant="default">default</Badge>
            <Badge variant="secondary">secondary</Badge>
            <Badge variant="outline">outline</Badge>
            <Badge variant="destructive">destructive</Badge>
            <Badge variant="aegean">aegean</Badge>
            <Badge variant="aegeanOutline">aegean outline</Badge>
            <Badge variant="forge">forge</Badge>
            <Badge variant="forgeOutline">forge outline</Badge>
            <Badge variant="anvil">anvil</Badge>
            <Badge variant="anvilOutline">anvil outline</Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant="aegean">queued</Badge>
            <Badge variant="forge">running</Badge>
            <Badge variant="anvil">completed</Badge>
            <Badge variant="aegeanOutline">ariadne</Badge>
            <Badge variant="forgeOutline">priority</Badge>
            <Badge variant="anvilOutline">worker-03</Badge>
            <Badge variant="destructive">failed</Badge>
          </div>
        </section>

        {/* ── 10b. task status badges ── */}
        <section className="space-y-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Task Status Badges</h2>
            <p className="text-sm text-muted-foreground">
              seven task states shown in three visual styles, compared side by side.
            </p>
          </div>

          {/* three styles comparison */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* style A: colored fill */}
            <div>
              <h3 className="mb-1 text-sm font-medium">style A: colored fill</h3>
              <p className="mb-3 text-xs text-muted-foreground">
                colored bg + colored text. high signal, strong visual grouping.
              </p>
              <div className="flex flex-col gap-2">
                {STATUS_DEFS.map((def) => (
                  <FilledBadge key={def.label} def={def} density="full" />
                ))}
              </div>
            </div>

            {/* style B: neutral */}
            <div>
              <h3 className="mb-1 text-sm font-medium">style B: neutral</h3>
              <p className="mb-3 text-xs text-muted-foreground">
                stone bg, tinted icon only. quieter, lets the icon carry meaning.
              </p>
              <div className="flex flex-col gap-2">
                {STATUS_DEFS.map((def) => (
                  <NeutralBadge key={def.label} def={def} density="full" />
                ))}
              </div>
            </div>

            {/* style C: colored border */}
            <div>
              <h3 className="mb-1 text-sm font-medium">style C: colored border</h3>
              <p className="mb-3 text-xs text-muted-foreground">
                no bg fill, colored border + icon + text. lighter footprint.
              </p>
              <div className="flex flex-col gap-2">
                {STATUS_DEFS.map((def) => (
                  <BorderBadge key={def.label} def={def} density="full" />
                ))}
              </div>
            </div>
          </div>

          {/* badge density */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium">badge density</h3>
              <p className="text-xs text-muted-foreground">
                full (icon + label), compact (icon + short code), and icon-only for each style.
              </p>
            </div>

            {(["A", "B", "C"] as const).map((style) => {
              const Comp = style === "A" ? FilledBadge : style === "B" ? NeutralBadge : BorderBadge
              const label = style === "A" ? "colored fill" : style === "B" ? "neutral" : "colored border"
              return (
                <div key={style}>
                  <h4 className="mb-3 text-sm font-medium text-muted-foreground">style {style}: {label}</h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {(["full", "compact", "icon"] as const).map((density) => (
                      <div key={density}>
                        <p className="mb-2 text-xs text-muted-foreground">{density}</p>
                        <div className="flex flex-wrap gap-2">
                          {STATUS_DEFS.map((def) => (
                            <Comp key={def.label} def={def} density={density} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* in context: mock task table */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">in context</h3>
              <p className="text-xs text-muted-foreground">
                simulated task table rows showing how badges look in real usage.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3 text-left font-medium text-muted-foreground">status</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">model</th>
                    <th className="p-3 text-left font-medium text-muted-foreground">target</th>
                    <th className="p-3 text-right font-medium text-muted-foreground">runtime</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_TASKS.map((row, i) => {
                    const def = STATUS_DEFS.find((d) => d.label === row.status)!
                    return (
                      <tr
                        key={i}
                        className="border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                      >
                        <td className="p-3">
                          <FilledBadge def={def} density="full" />
                        </td>
                        <td className="p-3">{row.model}</td>
                        <td className="p-3 font-mono text-xs">{row.smiles}</td>
                        <td className="p-3 text-right font-mono text-xs text-muted-foreground">{row.time}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* molecule state badges */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">molecule state badges</h3>
              <p className="text-xs text-muted-foreground">
                from the route visualization layer — chemistry-specific, independent of page theme.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {MOLECULE_STATES.map((state) => (
                <Badge
                  key={state.label}
                  variant="secondary"
                  className={`border-transparent ${state.badge}`}
                >
                  {state.label}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* ── 11. tooltips ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Tooltips</h2>
          <p className="text-sm text-muted-foreground">
            Hover over buttons to see explanatory tooltip content.
          </p>
          <TooltipProvider>
            <div className="flex flex-wrap gap-4">
              <Tooltip>
                <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                  <Info className="size-4" />
                  System Status
                </TooltipTrigger>
                <TooltipContent variant="default">
                  <p>View system health and worker status</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<Button variant="aegean" size="sm" />}>
                  <Send className="size-4" />
                  Submit Task
                </TooltipTrigger>
                <TooltipContent variant="aegean">
                  <p>Queue this molecule for retrosynthesis</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<Button variant="forge" size="sm" />}>
                  <Search className="size-4" />
                  Analyze
                </TooltipTrigger>
                <TooltipContent variant="forge">
                  <p>Run route analysis on selected targets</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<Button variant="anvil" size="sm" />}>
                  <Settings className="size-4" />
                  Admin
                </TooltipTrigger>
                <TooltipContent variant="anvil">
                  <p>Manage workers, queues, and system configuration</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </section>

        {/* ── 12. dropdown menu ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Dropdown Menu</h2>
          <p className="text-sm text-muted-foreground">
            Full-featured dropdown with groups, submenus, checkboxes, and radio
            items — all with variant props.
          </p>
          <div className="flex flex-wrap gap-4">
            {/* default dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" />}>
                <Settings className="size-4" />
                Default Menu
                <ChevronDown className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <User className="size-4" />
                    Profile
                    <DropdownMenuShortcut>Shift+P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Cog className="size-4" />
                    Settings
                    <DropdownMenuShortcut>Cmd+,</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Keyboard className="size-4" />
                    Keyboard shortcuts
                    <DropdownMenuShortcut>Cmd+K</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <UserPlus className="size-4" />
                    Invite users
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>
                      <Mail className="size-4" />
                      Email
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <MessageSquare className="size-4" />
                      Message
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={showStatusBar}
                  onCheckedChange={setShowStatusBar}
                >
                  Show status bar
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={showPanel}
                  onCheckedChange={setShowPanel}
                >
                  Show panel
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={dropdownRadio}
                  onValueChange={setDropdownRadio}
                >
                  <DropdownMenuRadioItem value="system">
                    System
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="light">
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark">
                    Dark
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* aegean dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="aegean" />}>
                <FlaskConical className="size-4" />
                Aegean Menu
                <ChevronDown className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent variant="aegean" className="w-56">
                <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
                <DropdownMenuSeparator variant="aegean" />
                <DropdownMenuGroup>
                  <DropdownMenuItem theme="aegean">
                    <Send className="size-4" />
                    Submit batch
                    <DropdownMenuShortcut>Cmd+S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem theme="aegean">
                    <Zap className="size-4" />
                    Priority submit
                    <DropdownMenuShortcut>Cmd+Shift+S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator variant="aegean" />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger variant="aegean">
                    <GitBranch className="size-4" />
                    Execution mode
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent variant="aegean">
                    <DropdownMenuItem theme="aegean">
                      Cold subprocess
                    </DropdownMenuItem>
                    <DropdownMenuItem theme="aegean">
                      Warm HTTP
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator variant="aegean" />
                <DropdownMenuCheckboxItem
                  variant="aegean"
                  checked={showStatusBar}
                  onCheckedChange={setShowStatusBar}
                >
                  Auto-retry on failure
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  variant="aegean"
                  checked={showPanel}
                  onCheckedChange={setShowPanel}
                >
                  Notify on completion
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* forge dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="forge" />}>
                <TestTube className="size-4" />
                Forge Menu
                <ChevronDown className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent variant="forge" className="w-56">
                <DropdownMenuLabel>Analysis</DropdownMenuLabel>
                <DropdownMenuSeparator variant="forge" />
                <DropdownMenuItem theme="forge">
                  <Search className="size-4" />
                  Search routes
                </DropdownMenuItem>
                <DropdownMenuItem theme="forge">
                  <ListTodo className="size-4" />
                  Compare models
                </DropdownMenuItem>
                <DropdownMenuSeparator variant="forge" />
                <DropdownMenuLabel>Depth</DropdownMenuLabel>
                <DropdownMenuRadioGroup value="3">
                  <DropdownMenuRadioItem variant="forge" value="1">
                    1 step
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem variant="forge" value="3">
                    3 steps
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem variant="forge" value="5">
                    5 steps
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* anvil dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="anvil" />}>
                <Server className="size-4" />
                Anvil Menu
                <ChevronDown className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent variant="anvil" className="w-56">
                <DropdownMenuLabel>Results</DropdownMenuLabel>
                <DropdownMenuSeparator variant="anvil" />
                <DropdownMenuItem theme="anvil">
                  <Sparkles className="size-4" />
                  View best route
                </DropdownMenuItem>
                <DropdownMenuItem theme="anvil">
                  <GitBranch className="size-4" />
                  Compare routes
                </DropdownMenuItem>
                <DropdownMenuSeparator variant="anvil" />
                <DropdownMenuCheckboxItem
                  variant="anvil"
                  checked={showPanel}
                  onCheckedChange={setShowPanel}
                >
                  Include intermediates
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>

        {/* ── 13. command palette ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Command Palette
          </h2>
          <p className="text-sm text-muted-foreground">
            Inline command palette with themed items across variant families.
          </p>
          <Command className="rounded-lg border shadow-md">
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Aegean (Tasks)">
                <CommandItem variant="aegean">
                  <Send className="size-4" />
                  Submit new task
                </CommandItem>
                <CommandItem variant="aegean">
                  <Zap className="size-4" />
                  Priority submission
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Forge (Analysis)">
                <CommandItem variant="forge">
                  <Search className="size-4" />
                  Search routes
                </CommandItem>
                <CommandItem variant="forge">
                  <TestTube className="size-4" />
                  Compare models
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Anvil (Admin)">
                <CommandItem variant="anvil">
                  <Settings className="size-4" />
                  Open settings
                </CommandItem>
                <CommandItem variant="anvil">
                  <ListTodo className="size-4" />
                  View workers
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </section>

        {/* ── 14. accordion ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Accordion</h2>
          <p className="text-sm text-muted-foreground">
            Collapsible FAQ sections about the daedalus system.
          </p>
          <Accordion className="w-full">
            <AccordionItem value="what">
              <AccordionTrigger>What is daedalus?</AccordionTrigger>
              <AccordionContent>
                Daedalus is the orchestration and execution layer for the
                ischemist retrosynthesis ecosystem. It accepts synthesis planning
                tasks, schedules them with fairness constraints, and executes
                them against heterogeneous model runtimes.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="how">
              <AccordionTrigger>
                How does the dual-mode worker operate?
              </AccordionTrigger>
              <AccordionContent>
                The worker supports two execution modes: cold subprocess (via{" "}
                <code className="font-mono text-xs">uv run --directory</code>)
                for on-demand invocations, and warm HTTP forwarding to a
                long-lived runtime service for low-latency inference.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="runtimes">
              <AccordionTrigger>
                Where do model runtimes live?
              </AccordionTrigger>
              <AccordionContent>
                Runtimes live in their own repositories (e.g. project-ariadne).
                Daedalus defines the contract they implement but does not contain
                model-specific code. This separation keeps the orchestration
                layer model-agnostic.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fairness">
              <AccordionTrigger>
                What is the fairness scheduler?
              </AccordionTrigger>
              <AccordionContent>
                The scheduler polls Postgres for pending tasks and applies
                fairness constraints (round-robin across users, priority
                weighting) before enqueuing jobs to Redis via RQ. This prevents
                any single user from monopolizing compute resources.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* ── 15. popover ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Popover</h2>
          <p className="text-sm text-muted-foreground">
            Click buttons to open popover panels with contextual info.
          </p>
          <div className="flex flex-wrap gap-4">
            <Popover>
              <PopoverTrigger render={<Button variant="aegeanOutline" size="sm" />}>
                Task Info
              </PopoverTrigger>
              <PopoverContent variant="aegean">
                <PopoverHeader>
                  <PopoverTitle>Task Configuration</PopoverTitle>
                  <PopoverDescription>
                    Configure parameters for the retrosynthesis task.
                  </PopoverDescription>
                </PopoverHeader>
                <div className="grid gap-2 pt-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-xs">Model</Label>
                    <span className="col-span-2 text-xs text-muted-foreground">ariadne-v2</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-xs">Depth</Label>
                    <span className="col-span-2 text-xs text-muted-foreground">5 steps</span>
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <Label className="text-xs">Beam</Label>
                    <span className="col-span-2 text-xs text-muted-foreground">10</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger render={<Button variant="forgeOutline" size="sm" />}>
                Worker Status
              </PopoverTrigger>
              <PopoverContent variant="forge">
                <PopoverHeader>
                  <PopoverTitle>Worker Pool</PopoverTitle>
                  <PopoverDescription>
                    3 of 8 workers currently active.
                  </PopoverDescription>
                </PopoverHeader>
                <div className="grid gap-1 pt-2 text-xs text-muted-foreground">
                  <p>worker-01: idle (cold)</p>
                  <p>worker-02: processing aspirin-batch</p>
                  <p>worker-03: processing ibuprofen-screen</p>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger render={<Button variant="anvilOutline" size="sm" />}>
                Queue Info
              </PopoverTrigger>
              <PopoverContent variant="anvil">
                <PopoverHeader>
                  <PopoverTitle>Queue Metrics</PopoverTitle>
                  <PopoverDescription>
                    Current Redis/RQ queue statistics.
                  </PopoverDescription>
                </PopoverHeader>
                <div className="grid gap-1 pt-2 text-xs text-muted-foreground">
                  <p>Pending: 12 tasks</p>
                  <p>Running: 3 tasks</p>
                  <p>Completed today: 847</p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </section>

        {/* ── 16. calendar ── */}
        <section className="space-y-10">
          <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
          <p className="text-sm text-muted-foreground">
            Date pickers in popover and inline modes, themed per family.
          </p>

          {/* popover date pickers */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              popover date pickers
            </h3>
            <p className="text-xs text-muted-foreground">
              a popover with a calendar inside, triggered by a button — one per family.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {FAMILIES.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-3">
                  <span className={cn("text-xs font-semibold uppercase tracking-wider", text[key])}>
                    {label}
                  </span>
                  <PopoverDatePicker
                    variant={key}
                    value={popoverDates[key]}
                    onSelect={(date) =>
                      setPopoverDates((prev) => ({ ...prev, [key]: date }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* inline calendar */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              inline calendar
            </h3>
            <p className="text-xs text-muted-foreground">
              a calendar rendered directly inside a card, single selection mode.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {FAMILIES.map(({ key, label }) => (
                <Card key={key} className={cn("border", borders[key])}>
                  <CardHeader>
                    <CardTitle className={text[key]}>select a date</CardTitle>
                    <CardDescription>
                      click a day to select it.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-start gap-4">
                    <Calendar
                      variant={key}
                      mode="single"
                      selected={inlineDates[key]}
                      onSelect={(d) =>
                        setInlineDates((prev) => ({ ...prev, [key]: d }))
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      {inlineDates[key]
                        ? `selected: ${inlineDates[key]!.toLocaleDateString()}`
                        : "no date selected"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* inline range calendar */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              inline range calendar
            </h3>
            <p className="text-xs text-muted-foreground">
              a calendar in range mode — click to set start, click again to set end.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {FAMILIES.map(({ key, label }) => (
                <Card key={key} className={cn("border", borders[key])}>
                  <CardHeader>
                    <CardTitle className={text[key]}>select a range</CardTitle>
                    <CardDescription>
                      pick start and end dates for a synthesis window.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-start gap-4">
                    <Calendar
                      variant={key}
                      mode="range"
                      selected={ranges[key]}
                      onSelect={(r) =>
                        setRanges((prev) => ({ ...prev, [key]: r }))
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      {ranges[key]?.from && ranges[key]?.to
                        ? `range: ${ranges[key]!.from!.toLocaleDateString()} \u2013 ${ranges[key]!.to!.toLocaleDateString()}`
                        : ranges[key]?.from
                          ? `start: ${ranges[key]!.from!.toLocaleDateString()} \u2013 pick an end date`
                          : "no range selected"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* form-style date pickers */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              form-style date pickers
            </h3>
            <p className="text-xs text-muted-foreground">
              three date pickers in a row, as they might appear in a synthesis job form.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {(["start", "end", "deadline"] as const).map((field, i) => {
                const family = FAMILIES[i]!
                return (
                  <div key={field} className="flex flex-col gap-3">
                    <Label
                      htmlFor={`${field}-date`}
                      className={cn("px-1 text-sm", text[family.key])}
                    >
                      {field} date
                    </Label>
                    <PopoverDatePicker
                      id={`${field}-date`}
                      variant={family.key}
                      value={formDates[field]}
                      onSelect={(date) =>
                        setFormDates((prev) => ({ ...prev, [field]: date }))
                      }
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── 17. skeleton ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Skeleton</h2>
          <p className="text-sm text-muted-foreground">
            Loading placeholders with themed pulse colors for each family.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {FAMILIES.map(({ key, label }) => (
              <div key={key} className="space-y-3">
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wider",
                    text[key]
                  )}
                >
                  {label}
                </span>
                <div className="flex items-center gap-4">
                  <Skeleton variant={key} className="size-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton variant={key} className="h-4 w-[140px]" />
                    <Skeleton variant={key} className="h-4 w-[100px]" />
                  </div>
                </div>
                <Skeleton variant={key} className="h-4 w-full" />
                <Skeleton variant={key} className="h-4 w-[80%]" />
                <Skeleton variant={key} className="h-20 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
