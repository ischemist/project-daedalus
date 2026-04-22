import { LayoutDashboardIcon, type LucideIcon } from "lucide-react"

export type AppNavItem = {
  href: string
  title: string
  icon: LucideIcon
}

export const appNavItems: AppNavItem[] = [
  {
    href: "/dashboard",
    title: "dashboard",
    icon: LayoutDashboardIcon,
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
