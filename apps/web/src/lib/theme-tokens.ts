/**
 * Design System Theme Tokens — daedalus
 *
 * SINGLE SOURCE OF TRUTH for all variant-specific colors.
 * Components MUST import from here — no inline color definitions.
 *
 * Three color families, each with a distinct semantic role:
 *
 *   family     tailwind scale       role
 *   --------   -----------------    ----------------------------------------
 *   aegean     teal-800 / 500       platform identity, navigation, surfaces
 *   forge      amber-800 / 500      actions that enqueue work (submit, run)
 *   anvil      slate-700 / 400      structural chrome, admin, infra mgmt
 *
 * Plus two structural variants:
 *   default    stone / neutral      chrome with no domain signal
 *   destructive rose / red          cancellations, deletions, irreversible actions
 *
 * The underlying Tailwind color scale is preserved in the token values
 * (e.g. aegean still emits `text-teal-800`) — only the family NAME that
 * product code references has changed.
 */

export type ThemeVariant = "default" | "aegean" | "forge" | "anvil"

export type ColorFamily = "aegean" | "forge" | "anvil"

export const THEME_TOKENS = {
  // ─── shared semantic tokens ────────────────────────────────────
  // consumed by multiple component types (dropdowns, selects, dialogs, cards)

  backgrounds: {
    default:
      "bg-white text-popover-foreground dark:bg-zinc-950 dark:text-stone-200",
    aegean: "bg-white text-teal-800 dark:bg-zinc-950 dark:text-teal-200",
    forge: "bg-white text-stone-700 dark:bg-zinc-950 dark:text-stone-200",
    anvil: "bg-white text-slate-700 dark:bg-zinc-950 dark:text-slate-200",
    destructive: "bg-white text-red-700 dark:bg-zinc-950 dark:text-red-200",
  },

  borders: {
    default: "border-stone-200/40 dark:border-stone-600/40",
    aegean: "border-teal-700/25 dark:border-teal-500/35",
    forge: "border-amber-700/25 dark:border-amber-500/35",
    anvil: "border-slate-500/30 dark:border-slate-400/35",
    destructive: "border-red-500/30 dark:border-red-400/35",
  },

  text: {
    default: "text-stone-700 dark:text-stone-200",
    aegean: "text-teal-800 dark:text-teal-500",
    forge: "text-amber-800 dark:text-amber-500",
    anvil: "text-slate-700 dark:text-slate-300",
    destructive: "text-red-700 dark:text-red-200",
  },

  icons: {
    default: "text-stone-500 dark:text-stone-400",
    aegean: "text-teal-700 dark:text-teal-500",
    forge: "text-amber-700 dark:text-amber-500",
    anvil: "text-slate-600 dark:text-slate-400",
  },

  interactive: {
    default: [
      "focus:bg-stone-100/50 data-[highlighted]:bg-stone-100/50",
      "dark:focus:bg-stone-800/30 dark:data-[highlighted]:bg-stone-800/30",
      "focus:text-stone-700 data-[highlighted]:text-stone-700",
      "dark:focus:text-stone-200 dark:data-[highlighted]:text-stone-200",
      "[&_svg:not([class*='text-'])]:text-muted-foreground",
    ].join(" "),
    aegean: [
      "focus:bg-teal-700/8 data-[highlighted]:bg-teal-700/8",
      "dark:focus:bg-teal-700/15 dark:data-[highlighted]:bg-teal-700/15",
      "focus:text-teal-800 data-[highlighted]:text-teal-800",
      "dark:focus:text-teal-500 dark:data-[highlighted]:text-teal-500",
      "[&_svg:not([class*='text-'])]:text-teal-700/70",
      "dark:[&_svg:not([class*='text-'])]:text-teal-500/70",
    ].join(" "),
    forge: [
      "focus:bg-amber-700/8 data-[highlighted]:bg-amber-700/8",
      "dark:focus:bg-amber-700/15 dark:data-[highlighted]:bg-amber-700/15",
      "focus:text-amber-800 data-[highlighted]:text-amber-800",
      "dark:focus:text-amber-500 dark:data-[highlighted]:text-amber-500",
      "[&_svg:not([class*='text-'])]:text-amber-700/70",
      "dark:[&_svg:not([class*='text-'])]:text-amber-500/70",
    ].join(" "),
    anvil: [
      "focus:bg-slate-500/10 data-[highlighted]:bg-slate-500/10",
      "dark:focus:bg-slate-800/30 dark:data-[highlighted]:bg-slate-800/30",
      "focus:text-slate-700 data-[highlighted]:text-slate-700",
      "dark:focus:text-slate-300 dark:data-[highlighted]:text-slate-300",
      "[&_svg:not([class*='text-'])]:text-slate-500/70",
      "dark:[&_svg:not([class*='text-'])]:text-slate-400/70",
    ].join(" "),
  },

  checkboxRadio: {
    default:
      "focus:bg-stone-100/50 dark:focus:bg-stone-800/30 focus:text-stone-700 dark:focus:text-stone-200 [&>span>svg]:text-stone-500 dark:[&>span>svg]:text-stone-400 data-checked:text-stone-700 dark:data-checked:text-stone-200",
    aegean:
      "focus:bg-teal-700/8 dark:focus:bg-teal-700/15 focus:text-teal-800 dark:focus:text-teal-500 [&>span>svg]:text-teal-700 dark:[&>span>svg]:text-teal-500 data-checked:text-teal-800 dark:data-checked:text-teal-500",
    forge:
      "focus:bg-amber-700/8 dark:focus:bg-amber-700/15 focus:text-amber-800 dark:focus:text-amber-500 [&>span>svg]:text-amber-700 dark:[&>span>svg]:text-amber-500 data-checked:text-amber-800 dark:data-checked:text-amber-500",
    anvil:
      "focus:bg-slate-500/10 dark:focus:bg-slate-800/30 focus:text-slate-700 dark:focus:text-slate-300 [&>span>svg]:text-slate-500 dark:[&>span>svg]:text-slate-400 data-checked:text-slate-700 dark:data-checked:text-slate-300",
  },

  subTrigger: {
    default:
      "focus:bg-stone-100/50 data-[state=open]:bg-stone-100/50 dark:focus:bg-stone-800/30 dark:data-[state=open]:bg-stone-800/30 focus:text-stone-700 data-[state=open]:text-stone-700 dark:focus:text-stone-200 dark:data-[state=open]:text-stone-200 [&_svg:not([class*='text-'])]:text-muted-foreground",
    aegean:
      "focus:bg-teal-700/8 data-[state=open]:bg-teal-700/8 dark:focus:bg-teal-700/15 dark:data-[state=open]:bg-teal-700/15 focus:text-teal-800 data-[state=open]:text-teal-800 dark:focus:text-teal-500 dark:data-[state=open]:text-teal-500 [&_svg:not([class*='text-'])]:text-teal-700/70 dark:[&_svg:not([class*='text-'])]:text-teal-500/70",
    forge:
      "focus:bg-amber-700/8 data-[state=open]:bg-amber-700/8 dark:focus:bg-amber-700/15 dark:data-[state=open]:bg-amber-700/15 focus:text-amber-800 data-[state=open]:text-amber-800 dark:focus:text-amber-500 dark:data-[state=open]:text-amber-500 [&_svg:not([class*='text-'])]:text-amber-700/70 dark:[&_svg:not([class*='text-'])]:text-amber-500/70",
    anvil:
      "focus:bg-slate-500/10 data-[state=open]:bg-slate-500/10 dark:focus:bg-slate-800/30 dark:data-[state=open]:bg-slate-800/30 focus:text-slate-700 data-[state=open]:text-slate-700 dark:focus:text-slate-300 dark:data-[state=open]:text-slate-300 [&_svg:not([class*='text-'])]:text-slate-500/70 dark:[&_svg:not([class*='text-'])]:text-slate-400/70",
  },

  separators: {
    default: "bg-border border-stone-200/40 dark:border-stone-600/40",
    aegean:
      "border-teal-700/25 dark:border-teal-500/35 bg-gradient-to-r from-transparent via-teal-700/25 to-transparent dark:via-teal-500/25",
    forge:
      "border-amber-700/25 dark:border-amber-500/35 bg-gradient-to-r from-transparent via-amber-700/25 to-transparent dark:via-amber-500/25",
    anvil:
      "border-slate-500/30 dark:border-slate-400/35 bg-gradient-to-r from-transparent via-slate-500/30 to-transparent dark:via-slate-400/25",
  },

  commandSelected: {
    default: "data-[selected=true]:bg-accent",
    aegean:
      "data-[selected=true]:bg-teal-700/8 dark:data-[selected=true]:bg-teal-700/15 data-[selected=true]:text-teal-800 dark:data-[selected=true]:text-teal-500 data-[selected=true]:border-teal-700/25 dark:data-[selected=true]:border-teal-700/25",
    forge:
      "data-[selected=true]:bg-amber-700/8 dark:data-[selected=true]:bg-amber-700/15 data-[selected=true]:text-amber-800 dark:data-[selected=true]:text-amber-500 data-[selected=true]:border-amber-700/25 dark:data-[selected=true]:border-amber-700/25",
    anvil:
      "data-[selected=true]:bg-slate-500/10 dark:data-[selected=true]:bg-slate-500/20 data-[selected=true]:text-slate-700 dark:data-[selected=true]:text-slate-300 data-[selected=true]:border-slate-500/30 dark:data-[selected=true]:border-slate-500/30",
  },

  triggers: {
    default:
      "border-stone-300/80 bg-white/40 text-stone-700 hover:bg-white/80 hover:text-stone-900 hover:border-stone-400 dark:border-stone-600/65 dark:bg-stone-800/5 dark:text-stone-200 dark:hover:bg-stone-700/30 dark:hover:border-stone-500/75 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] [&_svg:not([class*='text-'])]:text-stone-500/70 dark:[&_svg:not([class*='text-'])]:text-stone-400/70 data-[placeholder]:text-muted-foreground",
    aegean:
      "border-teal-700/25 dark:border-teal-500/35 text-teal-800 dark:text-teal-500 hover:border-teal-700/60 hover:bg-teal-700/5 dark:hover:border-teal-500/55 dark:hover:bg-teal-700/10 focus-visible:border-teal-700/50 dark:focus-visible:border-teal-500/55 focus-visible:ring-2 focus-visible:ring-teal-700/20 [&_svg:not([class*='text-'])]:text-teal-700/70 dark:[&_svg:not([class*='text-'])]:text-teal-500/70 data-[placeholder]:text-teal-600/40 dark:data-[placeholder]:text-teal-500/35",
    forge:
      "border-amber-700/25 dark:border-amber-500/35 text-amber-800 dark:text-amber-500 hover:border-amber-700/60 hover:bg-amber-700/5 dark:hover:border-amber-500/55 dark:hover:bg-amber-700/10 focus-visible:border-amber-700/50 dark:focus-visible:border-amber-500/55 focus-visible:ring-2 focus-visible:ring-amber-700/20 [&_svg:not([class*='text-'])]:text-amber-700/70 dark:[&_svg:not([class*='text-'])]:text-amber-500/70 data-[placeholder]:text-amber-600/40 dark:data-[placeholder]:text-amber-500/35",
    anvil:
      "border-slate-500/30 dark:border-slate-400/40 text-slate-700 dark:text-slate-300 hover:border-slate-500/70 hover:bg-slate-500/5 dark:hover:border-slate-400/55 dark:hover:bg-slate-500/10 focus-visible:border-slate-500/60 dark:focus-visible:border-slate-400/55 focus-visible:ring-2 focus-visible:ring-slate-500/20 [&_svg:not([class*='text-'])]:text-slate-500/70 dark:[&_svg:not([class*='text-'])]:text-slate-400/70 data-[placeholder]:text-slate-500/50 dark:data-[placeholder]:text-slate-400/40",
  },

  crumbBackgrounds: {
    default: "",
    aegean:
      "border-teal-700/25 bg-gradient-to-br from-teal-700/5 to-teal-600/5 dark:border-teal-500/35 dark:from-teal-700/10 dark:to-teal-600/5",
    forge:
      "border-amber-700/25 bg-gradient-to-br from-amber-700/5 to-amber-600/5 dark:border-amber-500/35 dark:from-amber-700/10 dark:to-amber-600/5",
    anvil:
      "border-slate-500/30 bg-gradient-to-br from-slate-500/10 to-slate-400/5 dark:border-slate-400/35 dark:from-slate-500/18 dark:to-slate-400/10",
  },

  headerTriggers: {
    default: "",
    aegean:
      "border-teal-700/20 text-teal-700 hover:border-teal-700/45 hover:bg-teal-700/5 hover:text-teal-800 dark:border-teal-500/25 dark:text-teal-400 dark:hover:border-teal-500/45 dark:hover:bg-teal-700/12 dark:hover:text-teal-300",
    forge:
      "border-amber-700/20 text-amber-700 hover:border-amber-700/45 hover:bg-amber-700/5 hover:text-amber-800 dark:border-amber-500/25 dark:text-amber-400 dark:hover:border-amber-500/45 dark:hover:bg-amber-700/12 dark:hover:text-amber-300",
    anvil:
      "border-slate-500/25 text-slate-700 hover:border-slate-500/45 hover:bg-slate-500/8 hover:text-slate-800 dark:border-slate-400/25 dark:text-slate-400 dark:hover:border-slate-400/45 dark:hover:bg-slate-500/12 dark:hover:text-slate-300",
  },

  headerSeparators: {
    default: "",
    aegean: "bg-teal-700/25 dark:bg-teal-500/35",
    forge: "bg-amber-700/25 dark:bg-amber-500/35",
    anvil: "bg-slate-500/30 dark:bg-slate-400/35",
  },

  breadcrumbLinks: {
    default: "",
    aegean:
      "text-teal-700/72 hover:text-teal-800 dark:text-teal-400/72 dark:hover:text-teal-300",
    forge:
      "text-amber-700/72 hover:text-amber-800 dark:text-amber-400/72 dark:hover:text-amber-300",
    anvil:
      "text-slate-700/72 hover:text-slate-800 dark:text-slate-400/72 dark:hover:text-slate-300",
  },

  breadcrumbPages: {
    default: "",
    aegean: "text-teal-800 dark:text-teal-400",
    forge: "text-amber-800 dark:text-amber-400",
    anvil: "text-slate-800 dark:text-slate-300",
  },

  breadcrumbSeparators: {
    default: "",
    aegean: "text-teal-500/40 dark:text-teal-400/30",
    forge: "text-amber-500/40 dark:text-amber-400/30",
    anvil: "text-slate-500/40 dark:text-slate-400/30",
  },

  pageHeaderBackgrounds: {
    default: "",
    aegean:
      "bg-gradient-to-br from-teal-700/5 to-teal-600/3 dark:from-teal-700/10 dark:to-teal-600/5",
    forge:
      "bg-gradient-to-br from-amber-700/5 to-amber-600/3 dark:from-amber-700/10 dark:to-amber-600/5",
    anvil:
      "bg-gradient-to-br from-slate-500/8 to-slate-400/4 dark:from-slate-500/12 dark:to-slate-400/6",
  },

  // ─── component-specific tokens ────────────────────────────────
  // each section maps 1:1 to a component file's CVA/variant definitions

  buttons: {
    // neutral
    default:
      "border-[1.5px] border-stone-300/80 bg-white/70 text-stone-800 hover:border-stone-400 hover:bg-white hover:text-stone-900 dark:border-primary/40 dark:bg-primary/5 dark:text-primary dark:hover:border-primary/70 dark:hover:bg-primary/10",
    outline:
      "border-[1.5px] border-stone-300/80 bg-white/40 text-stone-700 hover:bg-white/80 hover:text-stone-900 hover:border-stone-400 dark:border-stone-600/65 dark:bg-stone-800/5 dark:text-stone-200 dark:hover:bg-stone-700/30 dark:hover:border-stone-500/75",
    secondary:
      "border-[1.5px] border-stone-200/80 bg-stone-100/80 text-stone-700 hover:bg-stone-200/90 hover:text-stone-900 hover:border-stone-300 dark:border-stone-700/65 dark:bg-stone-800/30 dark:text-stone-200 dark:hover:bg-stone-700/50 dark:hover:border-stone-600/75",
    ghost:
      "border-none bg-transparent text-stone-700 dark:text-stone-300 hover:bg-stone-100/50 hover:text-stone-900 dark:hover:bg-stone-800/50 dark:hover:text-stone-100",
    link: "border-none bg-transparent text-primary underline-offset-4 hover:underline",

    // aegean — teal 800/500 — platform identity, navigation, surfaces
    aegean:
      "border-[1.5px] border-teal-700/25 dark:border-teal-500/35 bg-gradient-to-r from-teal-700/5 to-teal-600/5 text-teal-800 dark:text-teal-500 hover:border-teal-700/60 dark:hover:border-teal-500/65 hover:bg-teal-700/10 dark:hover:bg-teal-700/20 group",
    aegeanOutline:
      "border-[1.5px] border-teal-700/25 dark:border-teal-500/35 bg-transparent text-teal-800 dark:text-teal-500 hover:border-teal-700/60 hover:bg-teal-700/5 dark:hover:border-teal-500/65 dark:hover:bg-teal-700/10",
    aegeanGhost:
      "border-none bg-transparent text-teal-800 dark:text-teal-500 hover:bg-teal-700/5 dark:hover:bg-teal-700/10",
    aegeanSolid:
      "border-[1.5px] border-teal-700/70 bg-teal-700/90 text-white hover:bg-teal-800 hover:border-teal-800 dark:border-teal-500/75 dark:bg-teal-700/80 dark:hover:bg-teal-800/90 dark:hover:border-teal-800",

    // forge — amber 800/500 — actions that enqueue work (submit, run)
    forge:
      "border-[1.5px] border-amber-700/25 dark:border-amber-500/35 bg-gradient-to-r from-amber-700/5 to-amber-600/5 text-amber-800 dark:text-amber-500 hover:border-amber-700/60 dark:hover:border-amber-500/65 hover:bg-amber-700/10 dark:hover:bg-amber-700/20 group",
    forgeOutline:
      "border-[1.5px] border-amber-700/25 dark:border-amber-500/35 bg-transparent text-amber-800 dark:text-amber-500 hover:border-amber-700/60 hover:bg-amber-700/5 dark:hover:border-amber-500/65 dark:hover:bg-amber-700/10",
    forgeGhost:
      "border-none bg-transparent text-amber-800 dark:text-amber-500 hover:bg-amber-700/5 dark:hover:bg-amber-700/10",
    forgeSolid:
      "border-[1.5px] border-amber-700/70 bg-amber-700/90 text-white hover:bg-amber-800 hover:border-amber-800 dark:border-amber-500/75 dark:bg-amber-700/80 dark:hover:bg-amber-800/90 dark:hover:border-amber-800",

    // anvil — slate 700/400 — structural chrome, admin, infra mgmt
    anvil:
      "border-[1.5px] border-slate-500/30 dark:border-slate-400/35 bg-gradient-to-r from-slate-500/5 to-slate-400/5 text-slate-700 dark:text-slate-400 hover:border-slate-500/70 dark:hover:border-slate-400/65 hover:bg-slate-500/10 dark:hover:bg-slate-500/20 group",
    anvilOutline:
      "border-[1.5px] border-slate-500/30 dark:border-slate-400/35 bg-transparent text-slate-700 dark:text-slate-400 hover:border-slate-500/70 hover:bg-slate-500/5 dark:hover:border-slate-400/65 dark:hover:bg-slate-500/10",
    anvilGhost:
      "border-none bg-transparent text-slate-700 dark:text-slate-400 hover:bg-slate-500/10 dark:hover:bg-slate-500/10",
    anvilSolid:
      "border-[1.5px] border-slate-500/70 bg-slate-500/90 text-white hover:bg-slate-600 hover:border-slate-600 dark:border-slate-400/75 dark:bg-slate-500/80 dark:hover:bg-slate-600/90 dark:hover:border-slate-600",

    // destructive — rose/red — cancellations, deletions, irreversible actions
    destructive:
      "border-[1.5px] border-rose-500/30 dark:border-rose-400/35 bg-gradient-to-r from-rose-500/5 to-red-500/5 text-rose-700 dark:text-rose-400 hover:border-rose-500/70 dark:hover:border-rose-400/65 hover:bg-rose-500/10 dark:hover:bg-rose-500/20",
    destructiveOutline:
      "border-[1.5px] border-rose-500/30 dark:border-rose-400/35 bg-transparent text-rose-700 dark:text-rose-400 hover:border-rose-500/70 hover:bg-rose-500/5 dark:hover:border-rose-400/65 dark:hover:bg-rose-500/10",
    destructiveGhost:
      "border-none bg-transparent text-rose-700 dark:text-rose-400 hover:bg-rose-500/5 dark:hover:bg-rose-500/10",
    destructiveSolid:
      "border-[1.5px] border-rose-500/70 bg-rose-500/90 text-white hover:bg-rose-700 hover:border-rose-600 dark:border-rose-400/75 dark:bg-rose-500/80 dark:hover:bg-rose-600/90 dark:hover:border-rose-600",
  },

  // input + textarea variants (shared)
  inputs: {
    default:
      "border-stone-300/80 dark:border-stone-600/45 focus-visible:border-stone-400 dark:focus-visible:border-stone-500/65 focus-visible:ring-2 focus-visible:ring-stone-500/20",
    aegean:
      "border-teal-700/25 dark:border-teal-500/35 text-teal-800 dark:text-teal-200 placeholder:text-teal-600/40 dark:placeholder:text-teal-500/35 focus-visible:border-teal-700/50 dark:focus-visible:border-teal-500/55 focus-visible:ring-2 focus-visible:ring-teal-700/20",
    forge:
      "border-amber-700/25 dark:border-amber-500/35 text-amber-800 dark:text-amber-200 placeholder:text-amber-600/40 dark:placeholder:text-amber-500/35 focus-visible:border-amber-700/50 dark:focus-visible:border-amber-500/55 focus-visible:ring-2 focus-visible:ring-amber-700/20",
    anvil:
      "border-slate-500/30 dark:border-slate-400/40 text-slate-700 dark:text-slate-200 placeholder:text-slate-500/50 dark:placeholder:text-slate-400/40 focus-visible:border-slate-500/60 dark:focus-visible:border-slate-400/55 focus-visible:ring-2 focus-visible:ring-slate-500/20",
  },

  // standalone checkbox component variants
  checkboxes: {
    default:
      "border-input dark:border-stone-600/45 focus-visible:border-stone-400 focus-visible:ring-[3px] focus-visible:ring-stone-500/20 hover:border-stone-400 data-checked:border-stone-600 data-checked:bg-stone-600 dark:data-checked:bg-stone-600",
    aegean:
      "border-teal-700/25 dark:border-teal-500/35 focus-visible:border-teal-700/60 dark:focus-visible:border-teal-500/65 focus-visible:ring-[3px] focus-visible:ring-teal-700/30 hover:border-teal-700/60 dark:hover:border-teal-500/55 data-checked:border-teal-700 data-checked:bg-teal-700 dark:data-checked:bg-teal-700",
    forge:
      "border-amber-700/25 dark:border-amber-500/35 focus-visible:border-amber-700/60 dark:focus-visible:border-amber-500/65 focus-visible:ring-[3px] focus-visible:ring-amber-700/30 hover:border-amber-700/60 dark:hover:border-amber-500/55 data-checked:border-amber-700 data-checked:bg-amber-700 dark:data-checked:bg-amber-700",
    anvil:
      "border-slate-500/30 dark:border-slate-400/40 focus-visible:border-slate-500/70 dark:focus-visible:border-slate-400/55 focus-visible:ring-[3px] focus-visible:ring-slate-500/30 hover:border-slate-500/70 dark:hover:border-slate-400/55 data-checked:border-slate-600 data-checked:bg-slate-600 dark:data-checked:bg-slate-600",
  },

  // switch component variants
  switches: {
    default:
      "focus-visible:border-stone-400 focus-visible:ring-[3px] focus-visible:ring-stone-500/20 data-checked:bg-stone-600",
    aegean:
      "focus-visible:border-teal-700/60 focus-visible:ring-[3px] focus-visible:ring-teal-700/30 data-checked:bg-teal-700",
    forge:
      "focus-visible:border-amber-700/60 focus-visible:ring-[3px] focus-visible:ring-amber-700/30 data-checked:bg-amber-700",
    anvil:
      "focus-visible:border-slate-500/70 focus-visible:ring-[3px] focus-visible:ring-slate-500/30 data-checked:bg-slate-600",
  },

  // radio group item + indicator
  radios: {
    default: {
      item: "border-input dark:border-stone-600/45 text-stone-600 focus-visible:border-stone-400 focus-visible:ring-[3px] focus-visible:ring-stone-500/20 hover:border-stone-400",
      indicator: "fill-stone-600",
    },
    aegean: {
      item: "border-teal-700/25 dark:border-teal-500/35 text-teal-700 focus-visible:border-teal-700/60 dark:focus-visible:border-teal-500/65 focus-visible:ring-[3px] focus-visible:ring-teal-700/30 hover:border-teal-700/60 dark:hover:border-teal-500/55",
      indicator: "fill-teal-700",
    },
    forge: {
      item: "border-amber-700/25 dark:border-amber-500/35 text-amber-700 focus-visible:border-amber-700/60 dark:focus-visible:border-amber-500/65 focus-visible:ring-[3px] focus-visible:ring-amber-700/30 hover:border-amber-700/60 dark:hover:border-amber-500/55",
      indicator: "fill-amber-700",
    },
    anvil: {
      item: "border-slate-500/30 dark:border-slate-400/40 text-slate-600 focus-visible:border-slate-500/70 dark:focus-visible:border-slate-400/55 focus-visible:ring-[3px] focus-visible:ring-slate-500/30 hover:border-slate-500/70 dark:hover:border-slate-400/55",
      indicator: "fill-slate-600",
    },
  },

  // progress bar track + indicator
  progressBar: {
    default: {
      track: "bg-stone-500/20",
      indicator: "bg-stone-600 dark:bg-stone-500",
    },
    aegean: {
      track: "bg-teal-700/20",
      indicator: "bg-teal-700 dark:bg-teal-600",
    },
    forge: {
      track: "bg-amber-700/20",
      indicator: "bg-amber-700 dark:bg-amber-600",
    },
    anvil: {
      track: "bg-slate-500/20",
      indicator: "bg-slate-600 dark:bg-slate-500",
    },
  },

  // slider range + thumb
  sliders: {
    default: {
      range: "bg-stone-600 dark:bg-stone-500",
      thumb: "border-stone-600 ring-stone-500/30",
    },
    aegean: {
      range: "bg-teal-700 dark:bg-teal-600",
      thumb: "border-teal-700 ring-teal-700/30",
    },
    forge: {
      range: "bg-amber-700 dark:bg-amber-600",
      thumb: "border-amber-700 ring-amber-700/30",
    },
    anvil: {
      range: "bg-slate-600 dark:bg-slate-500",
      thumb: "border-slate-600 ring-slate-500/30",
    },
  },

  // dialog header / title overrides
  dialogs: {
    header: {
      default: "",
      aegean:
        "border-b-[1.5px] border-teal-300/30 dark:border-teal-500/35 pb-4 mb-4",
      forge:
        "border-b-[1.5px] border-amber-300/30 dark:border-amber-500/35 pb-4 mb-4",
      anvil:
        "border-b-[1.5px] border-slate-200/30 dark:border-slate-700/35 pb-4 mb-4",
    },
    title: {
      default: "",
      aegean: "text-teal-800 dark:text-teal-500",
      forge: "text-amber-800 dark:text-amber-500",
      anvil: "text-slate-700 dark:text-slate-400",
    },
  },

  // tab list + trigger themes
  tabs: {
    listLine: {
      default: "",
      aegean: "after:bg-teal-700/20",
      forge: "after:bg-amber-700/20",
      anvil: "after:bg-slate-500/20",
    },
    listFilled: {
      default: "",
      aegean: "border-teal-700/25",
      forge: "border-amber-700/25",
      anvil: "border-slate-500/30",
    },
    trigger: {
      default: {
        hover:
          "not-data-active:hover:text-stone-700 dark:not-data-active:hover:text-stone-400",
        focusRing:
          "focus-visible:ring-2 focus-visible:ring-stone-500/20 focus-visible:outline-none",
        lineActive:
          "group-data-[variant=line]/tabs-list:data-active:text-stone-700 dark:group-data-[variant=line]/tabs-list:data-active:text-stone-400",
        lineUnderline:
          "group-data-[variant=line]/tabs-list:data-active:after:bg-stone-500",
        filledActive:
          "group-data-[variant=filled]/tabs-list:data-active:bg-stone-500/5 group-data-[variant=filled]/tabs-list:data-active:text-stone-700 dark:group-data-[variant=filled]/tabs-list:data-active:bg-stone-500/10 dark:group-data-[variant=filled]/tabs-list:data-active:text-stone-400",
        filledHover:
          "group-data-[variant=filled]/tabs-list:not-data-active:hover:text-stone-700/70 group-data-[variant=filled]/tabs-list:not-data-active:hover:bg-stone-500/5 dark:group-data-[variant=filled]/tabs-list:not-data-active:hover:text-stone-400/70",
        filledText:
          "group-data-[variant=filled]/tabs-list:text-stone-700/50 dark:group-data-[variant=filled]/tabs-list:text-stone-400/50",
        defaultActive:
          "data-active:bg-background data-active:text-foreground group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-foreground dark:group-data-[variant=default]/tabs-list:data-active:border-input dark:group-data-[variant=default]/tabs-list:data-active:bg-input/30",
      },
      aegean: {
        hover:
          "not-data-active:hover:text-teal-800 dark:not-data-active:hover:text-teal-500",
        focusRing:
          "focus-visible:ring-2 focus-visible:ring-teal-700/20 focus-visible:outline-none",
        lineActive:
          "group-data-[variant=line]/tabs-list:data-active:text-teal-800 dark:group-data-[variant=line]/tabs-list:data-active:text-teal-500",
        lineUnderline:
          "group-data-[variant=line]/tabs-list:data-active:after:bg-teal-700",
        filledActive:
          "group-data-[variant=filled]/tabs-list:data-active:bg-teal-700/10 group-data-[variant=filled]/tabs-list:data-active:text-teal-800 dark:group-data-[variant=filled]/tabs-list:data-active:bg-teal-700/15 dark:group-data-[variant=filled]/tabs-list:data-active:text-teal-500",
        filledHover:
          "group-data-[variant=filled]/tabs-list:not-data-active:hover:text-teal-800/70 group-data-[variant=filled]/tabs-list:not-data-active:hover:bg-teal-700/5 dark:group-data-[variant=filled]/tabs-list:not-data-active:hover:text-teal-500/70",
        filledText:
          "group-data-[variant=filled]/tabs-list:text-teal-800/50 dark:group-data-[variant=filled]/tabs-list:text-teal-500/50",
        defaultActive:
          "data-active:bg-background data-active:text-teal-800 dark:data-active:text-teal-500 group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-teal-800 dark:group-data-[variant=default]/tabs-list:data-active:text-teal-500 dark:group-data-[variant=default]/tabs-list:data-active:border-teal-700/25 dark:group-data-[variant=default]/tabs-list:data-active:bg-teal-700/5",
      },
      forge: {
        hover:
          "not-data-active:hover:text-amber-800 dark:not-data-active:hover:text-amber-500",
        focusRing:
          "focus-visible:ring-2 focus-visible:ring-amber-700/20 focus-visible:outline-none",
        lineActive:
          "group-data-[variant=line]/tabs-list:data-active:text-amber-800 dark:group-data-[variant=line]/tabs-list:data-active:text-amber-500",
        lineUnderline:
          "group-data-[variant=line]/tabs-list:data-active:after:bg-amber-700",
        filledActive:
          "group-data-[variant=filled]/tabs-list:data-active:bg-amber-700/10 group-data-[variant=filled]/tabs-list:data-active:text-amber-800 dark:group-data-[variant=filled]/tabs-list:data-active:bg-amber-700/15 dark:group-data-[variant=filled]/tabs-list:data-active:text-amber-500",
        filledHover:
          "group-data-[variant=filled]/tabs-list:not-data-active:hover:text-amber-800/70 group-data-[variant=filled]/tabs-list:not-data-active:hover:bg-amber-700/5 dark:group-data-[variant=filled]/tabs-list:not-data-active:hover:text-amber-500/70",
        filledText:
          "group-data-[variant=filled]/tabs-list:text-amber-800/50 dark:group-data-[variant=filled]/tabs-list:text-amber-500/50",
        defaultActive:
          "data-active:bg-background data-active:text-amber-800 dark:data-active:text-amber-500 group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-amber-800 dark:group-data-[variant=default]/tabs-list:data-active:text-amber-500 dark:group-data-[variant=default]/tabs-list:data-active:border-amber-700/25 dark:group-data-[variant=default]/tabs-list:data-active:bg-amber-700/5",
      },
      anvil: {
        hover:
          "not-data-active:hover:text-slate-700 dark:not-data-active:hover:text-slate-400",
        focusRing:
          "focus-visible:ring-2 focus-visible:ring-slate-500/20 focus-visible:outline-none",
        lineActive:
          "group-data-[variant=line]/tabs-list:data-active:text-slate-700 dark:group-data-[variant=line]/tabs-list:data-active:text-slate-400",
        lineUnderline:
          "group-data-[variant=line]/tabs-list:data-active:after:bg-slate-500",
        filledActive:
          "group-data-[variant=filled]/tabs-list:data-active:bg-slate-500/10 group-data-[variant=filled]/tabs-list:data-active:text-slate-700 dark:group-data-[variant=filled]/tabs-list:data-active:bg-slate-500/15 dark:group-data-[variant=filled]/tabs-list:data-active:text-slate-400",
        filledHover:
          "group-data-[variant=filled]/tabs-list:not-data-active:hover:text-slate-700/70 group-data-[variant=filled]/tabs-list:not-data-active:hover:bg-slate-500/5 dark:group-data-[variant=filled]/tabs-list:not-data-active:hover:text-slate-400/70",
        filledText:
          "group-data-[variant=filled]/tabs-list:text-slate-700/50 dark:group-data-[variant=filled]/tabs-list:text-slate-400/50",
        defaultActive:
          "data-active:bg-background data-active:text-slate-700 dark:data-active:text-slate-400 group-data-[variant=default]/tabs-list:data-active:bg-background group-data-[variant=default]/tabs-list:data-active:text-slate-700 dark:group-data-[variant=default]/tabs-list:data-active:text-slate-400 dark:group-data-[variant=default]/tabs-list:data-active:border-slate-500/30 dark:group-data-[variant=default]/tabs-list:data-active:bg-slate-500/5",
      },
    },
  },

  // command item icon tint
  commandIcons: {
    default: "[&_svg:not([class*='text-'])]:text-muted-foreground",
    aegean:
      "[&_svg:not([class*='text-'])]:text-teal-700/70 dark:[&_svg:not([class*='text-'])]:text-teal-500/70",
    forge:
      "[&_svg:not([class*='text-'])]:text-amber-700/70 dark:[&_svg:not([class*='text-'])]:text-amber-500/70",
    anvil:
      "[&_svg:not([class*='text-'])]:text-slate-500/70 dark:[&_svg:not([class*='text-'])]:text-slate-400/70",
  },

  // popover content theming
  popovers: {
    default: "border-stone-200/40 dark:border-stone-600/40",
    aegean: "border-teal-500/20 dark:border-teal-500/35",
    forge: "border-amber-500/20 dark:border-amber-500/35",
    anvil: "border-slate-400/20 dark:border-slate-500/35",
  },

  // skeleton pulse colors
  skeletons: {
    default: "bg-muted",
    aegean: "bg-teal-500/10 dark:bg-teal-800/20",
    forge: "bg-amber-500/10 dark:bg-amber-800/20",
    anvil: "bg-slate-500/10 dark:bg-slate-700/20",
  },

  // calendar theming (today highlight, selected, range, focus ring)
  calendars: {
    default: {
      today: "rounded-md bg-muted text-foreground",
      rangeStart: "rounded-l-md bg-muted",
      rangeEnd: "rounded-r-md bg-muted",
      focusRing:
        "group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50",
      selected:
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
      dayRangeStart:
        "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
      dayRangeEnd:
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
      dayRangeMiddle:
        "data-[range-middle=true]:bg-muted/50 data-[range-middle=true]:text-foreground",
    },
    aegean: {
      today: "rounded-md bg-teal-500/15 text-teal-800 dark:text-teal-300",
      rangeStart: "rounded-l-md bg-teal-500/20",
      rangeEnd: "rounded-r-md bg-teal-500/20",
      focusRing:
        "group-data-[focused=true]/day:border-teal-500/60 group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-teal-500/30",
      selected:
        "data-[selected-single=true]:bg-teal-700 data-[selected-single=true]:text-white dark:data-[selected-single=true]:bg-teal-600",
      dayRangeStart:
        "data-[range-start=true]:bg-teal-700 data-[range-start=true]:text-white dark:data-[range-start=true]:bg-teal-600",
      dayRangeEnd:
        "data-[range-end=true]:bg-teal-700 data-[range-end=true]:text-white dark:data-[range-end=true]:bg-teal-600",
      dayRangeMiddle:
        "data-[range-middle=true]:bg-teal-500/15 data-[range-middle=true]:text-foreground",
    },
    forge: {
      today: "rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300",
      rangeStart: "rounded-l-md bg-amber-500/20",
      rangeEnd: "rounded-r-md bg-amber-500/20",
      focusRing:
        "group-data-[focused=true]/day:border-amber-500/60 group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-amber-500/30",
      selected:
        "data-[selected-single=true]:bg-amber-600 data-[selected-single=true]:text-white",
      dayRangeStart:
        "data-[range-start=true]:bg-amber-600 data-[range-start=true]:text-white",
      dayRangeEnd:
        "data-[range-end=true]:bg-amber-600 data-[range-end=true]:text-white",
      dayRangeMiddle:
        "data-[range-middle=true]:bg-amber-500/15 data-[range-middle=true]:text-foreground",
    },
    anvil: {
      today: "rounded-md bg-slate-500/15 text-slate-700 dark:text-slate-300",
      rangeStart: "rounded-l-md bg-slate-500/20",
      rangeEnd: "rounded-r-md bg-slate-500/20",
      focusRing:
        "group-data-[focused=true]/day:border-slate-500/60 group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-slate-500/30",
      selected:
        "data-[selected-single=true]:bg-slate-600 data-[selected-single=true]:text-white dark:data-[selected-single=true]:bg-slate-500",
      dayRangeStart:
        "data-[range-start=true]:bg-slate-600 data-[range-start=true]:text-white dark:data-[range-start=true]:bg-slate-500",
      dayRangeEnd:
        "data-[range-end=true]:bg-slate-600 data-[range-end=true]:text-white dark:data-[range-end=true]:bg-slate-500",
      dayRangeMiddle:
        "data-[range-middle=true]:bg-slate-500/15 data-[range-middle=true]:text-foreground",
    },
  },

  // tooltip content theming
  tooltips: {
    default: {
      content:
        "border-stone-300/50 text-stone-700 dark:border-stone-600/55 dark:text-stone-300",
      arrow: "bg-white dark:bg-zinc-950",
    },
    aegean: {
      content:
        "border-teal-500/30 text-teal-800 dark:border-teal-500/55 dark:text-teal-300",
      arrow: "bg-white dark:bg-zinc-950",
    },
    forge: {
      content:
        "border-amber-500/30 text-amber-800 dark:border-amber-500/55 dark:text-amber-300",
      arrow: "bg-white dark:bg-zinc-950",
    },
    anvil: {
      content:
        "border-slate-400/30 text-slate-700 dark:border-slate-500/55 dark:text-slate-300",
      arrow: "bg-white dark:bg-zinc-950",
    },
  },
} as const

// ─── page-level layout constants ────────────────────────────────
export const PAGE_GRADIENT =
  "from-background via-background/80 to-background min-h-screen bg-gradient-to-b"
export const PAGE_CONTENT_PADDING = "px-6 py-4"
export const PAGE_HEADER_PADDING = "p-4 sm:p-6"

// ─── backward-compat named exports ─────────────────────────────
// existing code imports these by name; they map into the THEME_TOKENS object

export const text = {
  aegean: THEME_TOKENS.text.aegean,
  forge: THEME_TOKENS.text.forge,
  anvil: THEME_TOKENS.text.anvil,
} as const

export const icons = {
  aegean: THEME_TOKENS.icons.aegean,
  forge: THEME_TOKENS.icons.forge,
  anvil: THEME_TOKENS.icons.anvil,
} as const

export const borders = {
  aegean: THEME_TOKENS.borders.aegean,
  forge: THEME_TOKENS.borders.forge,
  anvil: THEME_TOKENS.borders.anvil,
} as const

export const backgrounds = {
  aegean: "bg-teal-50 dark:bg-teal-950/40",
  forge: "bg-amber-50 dark:bg-amber-950/40",
  anvil: "bg-slate-50 dark:bg-slate-950/40",
} as const

export const interactive = {
  aegean: "hover:bg-teal-100/60 dark:hover:bg-teal-900/30",
  forge: "hover:bg-amber-100/60 dark:hover:bg-amber-900/30",
  anvil: "hover:bg-slate-100/60 dark:hover:bg-slate-800/30",
} as const

export const buttons = {
  aegean: {
    solid:
      "bg-teal-800 text-white hover:bg-teal-900 dark:bg-teal-600 dark:hover:bg-teal-700 dark:text-white",
    outline:
      "border-[1.5px] border-teal-700/30 text-teal-800 hover:bg-teal-50 dark:border-teal-500/30 dark:text-teal-400 dark:hover:bg-teal-950/50",
    ghost:
      "text-teal-800 hover:bg-teal-100/50 dark:text-teal-400 dark:hover:bg-teal-900/30",
  },
  forge: {
    solid:
      "bg-amber-800 text-white hover:bg-amber-900 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white",
    outline:
      "border-[1.5px] border-amber-700/30 text-amber-800 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-950/50",
    ghost:
      "text-amber-800 hover:bg-amber-100/50 dark:text-amber-400 dark:hover:bg-amber-900/30",
  },
  anvil: {
    solid:
      "bg-slate-700 text-white hover:bg-slate-800 dark:bg-slate-500 dark:hover:bg-slate-600 dark:text-white",
    outline:
      "border-[1.5px] border-slate-500/30 text-slate-700 hover:bg-slate-50 dark:border-slate-400/30 dark:text-slate-300 dark:hover:bg-slate-900/30",
    ghost:
      "text-slate-700 hover:bg-slate-100/50 dark:text-slate-300 dark:hover:bg-slate-800/30",
  },
} as const

export const badges = {
  aegean: "bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-400",
  forge: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400",
  anvil: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300",
} as const

export const rings = {
  aegean: "focus-visible:ring-teal-500/30 dark:focus-visible:ring-teal-400/30",
  forge: "focus-visible:ring-amber-500/30 dark:focus-visible:ring-amber-400/30",
  anvil: "focus-visible:ring-slate-500/30 dark:focus-visible:ring-slate-400/30",
} as const

export const progress = {
  aegean: {
    track: "bg-teal-200 dark:bg-teal-900/50",
    indicator: "bg-teal-800 dark:bg-teal-500",
  },
  forge: {
    track: "bg-amber-200 dark:bg-amber-900/50",
    indicator: "bg-amber-800 dark:bg-amber-500",
  },
  anvil: {
    track: "bg-slate-200 dark:bg-slate-800/50",
    indicator: "bg-slate-700 dark:bg-slate-400",
  },
} as const

export const controls = {
  aegean: "data-checked:bg-teal-800 dark:data-checked:bg-teal-600",
  forge: "data-checked:bg-amber-800 dark:data-checked:bg-amber-600",
  anvil: "data-checked:bg-slate-700 dark:data-checked:bg-slate-500",
} as const

export const tabs = {
  aegean: "data-active:text-teal-800 dark:data-active:text-teal-400",
  forge: "data-active:text-amber-800 dark:data-active:text-amber-400",
  anvil: "data-active:text-slate-700 dark:data-active:text-slate-300",
} as const

// ─── helper ─────────────────────────────────────────────────────
export function getThemeTokens(variant: ThemeVariant = "default") {
  return {
    background: THEME_TOKENS.backgrounds[variant],
    border: THEME_TOKENS.borders[variant],
    interactive: THEME_TOKENS.interactive[variant],
    text: THEME_TOKENS.text[variant],
    icon: THEME_TOKENS.icons[variant],
    checkboxRadio: THEME_TOKENS.checkboxRadio[variant],
    subTrigger: THEME_TOKENS.subTrigger[variant],
    separator: THEME_TOKENS.separators[variant],
    commandSelected: THEME_TOKENS.commandSelected[variant],
    trigger: THEME_TOKENS.triggers[variant],
    crumbBackground: THEME_TOKENS.crumbBackgrounds[variant],
    pageHeaderBackground: THEME_TOKENS.pageHeaderBackgrounds[variant],
  }
}
