"use client"

import { useMemo } from "react"
import type { Edge, Node } from "@xyflow/react"
import type {
  BuyableMetadata,
  ComparisonLayoutMode,
  RouteGraphNode,
  RouteVisualizationNode,
} from "@ischemist/routes"
import {
  buildDiffOverlayGraph,
  buildSideBySideGraph,
} from "@ischemist/routes/visualization"

import { FlowPanel } from "./flow-panel.js"

export type RouteComparisonProps = {
  referenceRoute: RouteVisualizationNode
  comparedRoute: RouteVisualizationNode
  mode: ComparisonLayoutMode
  inStockInchiKeys?: Set<string>
  buyableMetadataMap?: Map<string, BuyableMetadata>
  referenceLabel?: string
  comparedLabel?: string
}

export function RouteComparison({
  referenceRoute,
  comparedRoute,
  mode,
  inStockInchiKeys = new Set(),
  buyableMetadataMap,
  referenceLabel = "reference route",
  comparedLabel = "compared route",
}: RouteComparisonProps) {
  const graphs = useMemo(() => {
    if (mode === "diff-overlay") {
      return {
        diff: buildDiffOverlayGraph(
          referenceRoute,
          comparedRoute,
          inStockInchiKeys,
          buyableMetadataMap
        ),
        reference: null,
        compared: null,
      }
    }

    return {
      diff: null,
      reference: buildSideBySideGraph(
        referenceRoute,
        comparedRoute,
        true,
        "reference_",
        inStockInchiKeys,
        buyableMetadataMap,
        comparedRoute
      ),
      compared: buildSideBySideGraph(
        comparedRoute,
        referenceRoute,
        false,
        "compared_",
        inStockInchiKeys,
        buyableMetadataMap
      ),
    }
  }, [
    buyableMetadataMap,
    comparedRoute,
    inStockInchiKeys,
    mode,
    referenceRoute,
  ])

  if (mode === "diff-overlay" && graphs.diff) {
    return (
      <FlowPanel
        nodes={graphs.diff.nodes as Node<RouteGraphNode>[]}
        edges={graphs.diff.edges as Edge[]}
      />
    )
  }

  if (!graphs.reference || !graphs.compared) {
    return null
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        height: "100%",
      }}
    >
      <div
        style={{
          borderRight: "1px solid rgb(148 163 184 / 0.28)",
          minWidth: 0,
        }}
      >
        <FlowPanel
          nodes={graphs.reference.nodes as Node<RouteGraphNode>[]}
          edges={graphs.reference.edges as Edge[]}
          title={referenceLabel}
        />
      </div>
      <div style={{ minWidth: 0 }}>
        <FlowPanel
          nodes={graphs.compared.nodes as Node<RouteGraphNode>[]}
          edges={graphs.compared.edges as Edge[]}
          title={comparedLabel}
        />
      </div>
    </div>
  )
}
