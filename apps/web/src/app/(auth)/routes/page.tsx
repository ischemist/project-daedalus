import Link from "next/link"
import {
  PredictionComparison,
  RouteGraph,
  RouteLegend,
  RouteOverlay,
} from "@ischemist/route-viewer"
import type { ComparisonLayoutMode } from "@ischemist/routes"
import {
  GitBranchIcon,
  GitCompareArrowsIcon,
  LayersIcon,
  RouteIcon,
} from "lucide-react"

import {
  getRouteComparisonPageData,
  type RouteSummary,
  type RouteTargetGroup,
} from "@/lib/routes/queries"
import {
  PAGE_GRADIENT,
  PAGE_HEADER_PADDING,
  THEME_TOKENS,
} from "@/lib/theme-tokens"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"

export const dynamic = "force-dynamic"

type RoutesViewMode = "single" | "compare" | "overlay"

type RoutesPageProps = {
  searchParams: Promise<{
    ref?: string | string[]
    cmp?: string | string[]
    mode?: string | string[]
    view?: string | string[]
  }>
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

function parseComparisonMode(
  value: string | string[] | undefined
): ComparisonLayoutMode {
  return firstParam(value) === "diff-overlay" ? "diff-overlay" : "side-by-side"
}

function parseViewMode(value: string | string[] | undefined): RoutesViewMode {
  const view = firstParam(value)
  if (view === "single" || view === "overlay") return view
  return "compare"
}

function shortSignature(signature: string): string {
  return signature.slice(0, 12)
}

function routesHref({
  referenceId,
  comparedId,
  comparisonMode,
  viewMode,
}: {
  referenceId?: string
  comparedId?: string
  comparisonMode: ComparisonLayoutMode
  viewMode: RoutesViewMode
}) {
  const params = new URLSearchParams()

  if (referenceId) params.set("ref", referenceId)
  if (comparedId) params.set("cmp", comparedId)
  params.set("mode", comparisonMode)
  params.set("view", viewMode)

  return `/routes?${params.toString()}`
}

function RouteStats({ route }: { route: RouteSummary }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <Badge variant="anvilOutline">{route.length} steps</Badge>
      <Badge variant="anvilOutline">{route.nodeCount} nodes</Badge>
      {route.hasConvergentReaction ? (
        <Badge variant="forgeOutline">convergent</Badge>
      ) : null}
    </div>
  )
}

function TargetGroupLink({
  group,
  selectedRootMoleculeId,
  comparisonMode,
  viewMode,
}: {
  group: RouteTargetGroup
  selectedRootMoleculeId: string | undefined
  comparisonMode: ComparisonLayoutMode
  viewMode: RoutesViewMode
}) {
  const reference = group.routes[0]
  const compared = group.routes[1] ?? group.routes[0]
  const isSelected = group.rootMoleculeId === selectedRootMoleculeId

  return (
    <Link
      href={routesHref({
        referenceId: reference?.id,
        comparedId: compared?.id,
        comparisonMode,
        viewMode,
      })}
      className={cn(
        "grid gap-1 rounded-md border-[1.5px] px-3 py-2 text-left transition-colors",
        isSelected
          ? "border-teal-700/35 bg-teal-700/8 text-teal-900 dark:border-teal-500/35 dark:bg-teal-700/15 dark:text-teal-300"
          : "border-transparent hover:border-border hover:bg-muted/55"
      )}
    >
      <span className="font-mono text-xs break-all">
        {group.rootMolecule.smiles ?? group.rootMolecule.inchikey}
      </span>
      <span className="text-xs text-muted-foreground">
        {group.routes.length} routes
      </span>
    </Link>
  )
}

function RouteRow({
  route,
  index,
  selectedReference,
  selectedCompared,
  comparisonMode,
  viewMode,
}: {
  route: RouteSummary
  index: number
  selectedReference: RouteSummary
  selectedCompared: RouteSummary
  comparisonMode: ComparisonLayoutMode
  viewMode: RoutesViewMode
}) {
  const isReference = route.id === selectedReference.id
  const isCompared = route.id === selectedCompared.id

  return (
    <div
      className={cn(
        "grid gap-2 border-b border-border/70 px-3 py-2 text-sm last:border-b-0",
        isReference || isCompared ? "bg-teal-700/5 dark:bg-teal-700/10" : ""
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">route {index + 1}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {shortSignature(route.signature)}
          </span>
          {isReference ? <Badge variant="aegean">a</Badge> : null}
          {isCompared ? <Badge variant="forge">b</Badge> : null}
        </div>
        <RouteStats route={route} />
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <Link
          href={routesHref({
            referenceId: route.id,
            comparedId: selectedCompared.id,
            comparisonMode,
            viewMode: "single",
          })}
          className={cn(
            buttonVariants({
              variant:
                viewMode === "single" && isReference
                  ? "aegeanSolid"
                  : "outline",
              size: "sm",
            })
          )}
        >
          view
        </Link>
        <Link
          href={routesHref({
            referenceId: route.id,
            comparedId: selectedCompared.id,
            comparisonMode,
            viewMode,
          })}
          className={cn(
            buttonVariants({
              variant: isReference ? "aegeanSolid" : "outline",
              size: "sm",
            })
          )}
        >
          a
        </Link>
        <Link
          href={routesHref({
            referenceId: selectedReference.id,
            comparedId: route.id,
            comparisonMode,
            viewMode,
          })}
          className={cn(
            buttonVariants({
              variant: isCompared ? "forgeSolid" : "outline",
              size: "sm",
            })
          )}
        >
          b
        </Link>
      </div>
    </div>
  )
}

function ModeLink({
  href,
  active,
  icon: Icon,
  children,
}: {
  href: string
  active: boolean
  icon: typeof RouteIcon
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({
          variant: active ? "aegeanSolid" : "outline",
          size: "sm",
        }),
        "gap-1.5"
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </Link>
  )
}

export default async function RoutesPage({ searchParams }: RoutesPageProps) {
  const params = await searchParams
  const comparisonMode = parseComparisonMode(params.mode)
  const viewMode = parseViewMode(params.view)
  const data = await getRouteComparisonPageData({
    referenceRouteId: firstParam(params.ref),
    comparedRouteId: firstParam(params.cmp),
  })
  const selectedRootMoleculeId = data.selectedReference?.rootMoleculeId
  const selectedGroup = data.groups.find(
    (group) => group.rootMoleculeId === selectedRootMoleculeId
  )

  if (
    !data.selectedReference ||
    !data.selectedCompared ||
    !data.referenceTree ||
    !data.comparedTree ||
    !selectedGroup
  ) {
    return (
      <div className={cn(PAGE_GRADIENT, "flex w-full flex-col")}>
        <div
          className={cn(
            "border-b",
            THEME_TOKENS.borders.aegean,
            THEME_TOKENS.pageHeaderBackgrounds.aegean
          )}
        >
          <div className={cn(PAGE_HEADER_PADDING, "mx-auto max-w-7xl")}>
            <h1 className="font-heading text-lg font-medium text-teal-900 dark:text-teal-300">
              routes
            </h1>
            <p className="text-sm text-muted-foreground">no routes loaded</p>
          </div>
        </div>
      </div>
    )
  }

  const selectedRouteTrees = data.selectedGroupTrees.map((entry) => entry.tree)
  const viewTitle =
    viewMode === "overlay"
      ? "all routes overlay"
      : viewMode === "single"
        ? `route ${selectedGroup.routes.findIndex((route) => route.id === data.selectedReference?.id) + 1}`
        : comparisonMode === "diff-overlay"
          ? "difference overlay"
          : "route comparison"

  return (
    <div className={cn(PAGE_GRADIENT, "flex w-full flex-col")}>
      <div
        className={cn(
          "border-b",
          THEME_TOKENS.borders.aegean,
          THEME_TOKENS.pageHeaderBackgrounds.aegean
        )}
      >
        <div
          className={cn(PAGE_HEADER_PADDING, "mx-auto grid max-w-7xl gap-4")}
        >
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <h1 className="font-heading text-lg font-medium text-teal-900 dark:text-teal-300">
                routes
              </h1>
              <p className="font-mono text-sm break-all text-muted-foreground">
                {selectedGroup.rootMolecule.smiles ??
                  selectedGroup.rootMolecule.inchikey}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ModeLink
                href={routesHref({
                  referenceId: data.selectedReference.id,
                  comparedId: data.selectedCompared.id,
                  comparisonMode,
                  viewMode: "single",
                })}
                active={viewMode === "single"}
                icon={RouteIcon}
              >
                single
              </ModeLink>
              <ModeLink
                href={routesHref({
                  referenceId: data.selectedReference.id,
                  comparedId: data.selectedCompared.id,
                  comparisonMode,
                  viewMode: "compare",
                })}
                active={viewMode === "compare"}
                icon={GitCompareArrowsIcon}
              >
                compare
              </ModeLink>
              <ModeLink
                href={routesHref({
                  referenceId: data.selectedReference.id,
                  comparedId: data.selectedCompared.id,
                  comparisonMode,
                  viewMode: "overlay",
                })}
                active={viewMode === "overlay"}
                icon={LayersIcon}
              >
                overlay
              </ModeLink>
            </div>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <GitBranchIcon className="size-4 text-teal-700 dark:text-teal-400" />
              <span className="font-medium">{data.groups.length}</span>
              <span className="text-muted-foreground">targets</span>
            </div>
            <div className="flex items-center gap-2">
              <RouteIcon className="size-4 text-teal-700 dark:text-teal-400" />
              <span className="font-medium">{selectedGroup.routes.length}</span>
              <span className="text-muted-foreground">routes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {data.selectedReference.length}
              </span>
              <span className="text-muted-foreground">route a steps</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{viewTitle}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-h-[calc(100svh-12rem)] flex-1 grid-cols-1 xl:grid-cols-[300px_380px_minmax(0,1fr)]">
        <aside className="border-b border-border/70 xl:border-r xl:border-b-0">
          <div className="border-b border-border/70 px-3 py-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            targets
          </div>
          <div className="grid max-h-[34svh] gap-1 overflow-auto p-2 xl:max-h-[calc(100svh-12rem)]">
            {data.groups.map((group) => (
              <TargetGroupLink
                key={group.rootMoleculeId}
                group={group}
                selectedRootMoleculeId={selectedRootMoleculeId}
                comparisonMode={comparisonMode}
                viewMode={viewMode}
              />
            ))}
          </div>
        </aside>

        <aside className="border-b border-border/70 xl:border-r xl:border-b-0">
          <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              route set
            </span>
            {viewMode === "compare" ? (
              <div className="flex items-center gap-1">
                <Link
                  href={routesHref({
                    referenceId: data.selectedReference.id,
                    comparedId: data.selectedCompared.id,
                    comparisonMode: "side-by-side",
                    viewMode,
                  })}
                  className={cn(
                    buttonVariants({
                      variant:
                        comparisonMode === "side-by-side"
                          ? "aegeanSolid"
                          : "outline",
                      size: "xs",
                    })
                  )}
                >
                  side
                </Link>
                <Link
                  href={routesHref({
                    referenceId: data.selectedReference.id,
                    comparedId: data.selectedCompared.id,
                    comparisonMode: "diff-overlay",
                    viewMode,
                  })}
                  className={cn(
                    buttonVariants({
                      variant:
                        comparisonMode === "diff-overlay"
                          ? "aegeanSolid"
                          : "outline",
                      size: "xs",
                    })
                  )}
                >
                  diff
                </Link>
              </div>
            ) : null}
          </div>
          <div className="max-h-[42svh] overflow-auto xl:max-h-[calc(100svh-12rem)]">
            {selectedGroup.routes.map((route, index) => (
              <RouteRow
                key={route.id}
                route={route}
                index={index}
                selectedReference={data.selectedReference!}
                selectedCompared={data.selectedCompared!}
                comparisonMode={comparisonMode}
                viewMode={viewMode}
              />
            ))}
          </div>
        </aside>

        <main className="min-w-0">
          <div className="flex min-h-[calc(100svh-12rem)] flex-col">
            <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b border-border/70 px-3 py-2">
              <div className="min-w-0">
                <div className="text-sm font-medium">{viewTitle}</div>
                <div className="font-mono text-xs text-muted-foreground">
                  {viewMode === "single"
                    ? shortSignature(data.selectedReference.signature)
                    : viewMode === "overlay"
                      ? `${selectedRouteTrees.length} route trees`
                      : `${shortSignature(data.selectedReference.signature)} / ${shortSignature(data.selectedCompared.signature)}`}
                </div>
              </div>
              <RouteLegend
                viewMode={
                  viewMode === "compare" ? comparisonMode : "prediction-only"
                }
                isPredictionComparison={viewMode === "compare"}
                isOverlay={viewMode === "overlay"}
              />
            </div>
            <div className="h-[calc(100svh-15rem)] min-h-[620px]">
              {viewMode === "single" ? (
                <RouteGraph route={data.referenceTree} />
              ) : viewMode === "overlay" ? (
                <RouteOverlay routes={selectedRouteTrees} />
              ) : (
                <PredictionComparison
                  prediction1Route={data.referenceTree}
                  prediction2Route={data.comparedTree}
                  mode={comparisonMode}
                  model1Label={`route a ${shortSignature(data.selectedReference.signature)}`}
                  model2Label={`route b ${shortSignature(data.selectedCompared.signature)}`}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
