import {
  BoxesIcon,
  CogIcon,
  LayoutDashboardIcon,
  ListTreeIcon,
  type LucideIcon,
  NetworkIcon,
  SatelliteDishIcon,
} from "lucide-react"

export type AppNavItem = {
  href: string
  title: string
  summary: string
  icon: LucideIcon
}

export const appNavItems: AppNavItem[] = [
  {
    href: "/dashboard",
    title: "dashboard",
    summary: "queue health, active workers, and system posture.",
    icon: LayoutDashboardIcon,
  },
  {
    href: "/planning",
    title: "planning",
    summary: "submission entrypoint for retrosynthesis jobs.",
    icon: ListTreeIcon,
  },
  {
    href: "/runtimes",
    title: "runtimes",
    summary: "registered model runtimes and execution modes.",
    icon: SatelliteDishIcon,
  },
  {
    href: "/workers",
    title: "workers",
    summary: "worker pool capacity, leases, and execution health.",
    icon: NetworkIcon,
  },
  {
    href: "/artifacts",
    title: "artifacts",
    summary: "filesystem-backed task outputs and normalized routes.",
    icon: BoxesIcon,
  },
  {
    href: "/settings",
    title: "settings",
    summary: "auth, postgres, and local deployment configuration.",
    icon: CogIcon,
  },
]

const routeTitleOverrides = new Map(
  appNavItems.map((item) => [item.href.replace(/^\//, ""), item.title] as const)
)

function prettifySegment(segment: string) {
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function getBreadcrumbItems(segments: string[]) {
  return segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`
    const title = routeTitleOverrides.get(segments.slice(0, index + 1).join("/")) ?? prettifySegment(segment)

    return {
      href,
      title,
      isCurrent: index === segments.length - 1,
    }
  })
}
