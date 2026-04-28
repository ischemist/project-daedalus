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
  buildPredictionDiffOverlayGraph,
  buildPredictionSideBySideGraph,
  collectInchiKeys,
} from "@ischemist/routes/visualization"

import { FlowPanel } from "./flow-panel.js"

export type PredictionComparisonProps = {
  prediction1Route: RouteVisualizationNode
  prediction2Route: RouteVisualizationNode
  mode: ComparisonLayoutMode
  inStockInchiKeys?: Set<string>
  buyableMetadataMap?: Map<string, BuyableMetadata>
  model1Label?: string
  model2Label?: string
}

export function PredictionComparison({
  prediction1Route,
  prediction2Route,
  mode,
  inStockInchiKeys = new Set(),
  buyableMetadataMap,
  model1Label = "route 1",
  model2Label = "route 2",
}: PredictionComparisonProps) {
  const graphs = useMemo(() => {
    if (mode === "diff-overlay") {
      return {
        diff: buildPredictionDiffOverlayGraph(
          prediction1Route,
          prediction2Route,
          inStockInchiKeys,
          buyableMetadataMap
        ),
        pred1: null,
        pred2: null,
      }
    }

    const pred1InchiKeys = collectInchiKeys(prediction1Route)
    const pred2InchiKeys = collectInchiKeys(prediction2Route)

    return {
      diff: null,
      pred1: buildPredictionSideBySideGraph(
        prediction1Route,
        pred2InchiKeys,
        true,
        "pred1_",
        inStockInchiKeys,
        buyableMetadataMap
      ),
      pred2: buildPredictionSideBySideGraph(
        prediction2Route,
        pred1InchiKeys,
        false,
        "pred2_",
        inStockInchiKeys,
        buyableMetadataMap
      ),
    }
  }, [
    buyableMetadataMap,
    inStockInchiKeys,
    mode,
    prediction1Route,
    prediction2Route,
  ])

  if (mode === "diff-overlay" && graphs.diff) {
    return (
      <FlowPanel
        nodes={graphs.diff.nodes as Node<RouteGraphNode>[]}
        edges={graphs.diff.edges as Edge[]}
      />
    )
  }

  if (!graphs.pred1 || !graphs.pred2) {
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
          nodes={graphs.pred1.nodes as Node<RouteGraphNode>[]}
          edges={graphs.pred1.edges as Edge[]}
          title={model1Label}
        />
      </div>
      <div style={{ minWidth: 0 }}>
        <FlowPanel
          nodes={graphs.pred2.nodes as Node<RouteGraphNode>[]}
          edges={graphs.pred2.edges as Edge[]}
          title={model2Label}
        />
      </div>
    </div>
  )
}
