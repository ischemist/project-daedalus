import type { ComparisonLayoutMode, RouteLayoutMode } from "@ischemist/routes"

export type RouteLegendProps = {
  viewMode?: RouteLayoutMode | ComparisonLayoutMode
  isPredictionComparison?: boolean
  isOverlay?: boolean
}

function LegendSwatch({
  color,
  dashed,
  label,
}: {
  color: string
  dashed?: boolean
  label: string
}) {
  return (
    <span style={{ alignItems: "center", display: "inline-flex", gap: 6 }}>
      <span
        style={{
          background: "transparent",
          border: `2px ${dashed ? "dashed" : "solid"} ${color}`,
          borderRadius: 4,
          display: "inline-block",
          height: 14,
          width: 14,
        }}
      />
      <span>{label}</span>
    </span>
  )
}

function StockBadgeLegend({ label }: { label: string }) {
  return (
    <span style={{ alignItems: "center", display: "inline-flex", gap: 6 }}>
      <span
        style={{
          background: "rgb(16 185 129 / 0.14)",
          borderRadius: 6,
          color: "#047857",
          display: "inline-flex",
          fontSize: 12,
          fontWeight: 650,
          lineHeight: 1,
          padding: "3px 6px",
        }}
      >
        in stock
      </span>
      <span>{label}</span>
    </span>
  )
}

export function RouteLegend({
  viewMode = "prediction-only",
  isPredictionComparison = false,
  isOverlay = false,
}: RouteLegendProps) {
  const isComparisonMode =
    viewMode === "side-by-side" || viewMode === "diff-overlay"

  return (
    <div
      style={{
        alignItems: "center",
        background: "rgb(148 163 184 / 0.08)",
        border: "1px solid rgb(148 163 184 / 0.22)",
        borderRadius: 8,
        display: "flex",
        flexWrap: "wrap",
        gap: 14,
        padding: 10,
        fontSize: 13,
      }}
    >
      <span style={{ fontWeight: 650 }}>legend:</span>
      {isOverlay ? (
        <>
          <LegendSwatch color="#92400e" label="all routes" />
          <LegendSwatch color="#b45309" label="some routes" />
          <LegendSwatch color="#f59e0b" label="one route" />
        </>
      ) : null}
      {!isComparisonMode && !isOverlay ? (
        <StockBadgeLegend label="available molecule" />
      ) : null}
      {isComparisonMode && !isPredictionComparison ? (
        <>
          <LegendSwatch color="#10b981" label="match" />
          <LegendSwatch color="#f59e0b" label="extension" />
          {viewMode === "diff-overlay" ? (
            <LegendSwatch color="#9ca3af" dashed label="missing" />
          ) : null}
        </>
      ) : null}
      {isComparisonMode && isPredictionComparison ? (
        <>
          <LegendSwatch color="#64748b" label="shared" />
          <LegendSwatch color="#b45309" label="route a only" />
          <LegendSwatch color="#b45309" dashed label="route b only" />
        </>
      ) : null}
    </div>
  )
}
