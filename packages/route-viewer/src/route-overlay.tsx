"use client"

import { useMemo } from "react"
import type { Edge, Node } from "@xyflow/react"
import type {
  BuyableMetadata,
  RouteGraphNode,
  RouteVisualizationNode,
} from "@ischemist/routes"
import { buildRouteOverlayGraph } from "@ischemist/routes/visualization"

import { FlowPanel } from "./flow-panel.js"

export type RouteOverlayProps = {
  routes: RouteVisualizationNode[]
  inStockInchiKeys?: Set<string>
  buyableMetadataMap?: Map<string, BuyableMetadata>
  idPrefix?: string
}

export function RouteOverlay({
  routes,
  inStockInchiKeys = new Set(),
  buyableMetadataMap,
  idPrefix = "overlay_",
}: RouteOverlayProps) {
  const graph = useMemo(
    () =>
      buildRouteOverlayGraph(
        routes,
        inStockInchiKeys,
        idPrefix,
        buyableMetadataMap
      ),
    [buyableMetadataMap, idPrefix, inStockInchiKeys, routes]
  )

  return (
    <FlowPanel
      nodes={graph.nodes as Node<RouteGraphNode>[]}
      edges={graph.edges as Edge[]}
    />
  )
}
