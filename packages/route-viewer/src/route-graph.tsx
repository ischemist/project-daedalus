"use client"

import { useMemo } from "react"
import type { Edge, Node } from "@xyflow/react"
import type {
  BuyableMetadata,
  RouteGraphNode,
  RouteVisualizationNode,
} from "@ischemist/routes"
import { buildRouteGraph } from "@ischemist/routes/visualization"

import { FlowPanel } from "./flow-panel.js"

export type RouteGraphProps = {
  route: RouteVisualizationNode
  inStockInchiKeys?: Set<string>
  buyableMetadataMap?: Map<string, BuyableMetadata>
  idPrefix?: string
}

export function RouteGraph({
  route,
  inStockInchiKeys = new Set(),
  buyableMetadataMap,
  idPrefix = "route-",
}: RouteGraphProps) {
  const graph = useMemo(
    () =>
      buildRouteGraph(route, inStockInchiKeys, idPrefix, buyableMetadataMap),
    [buyableMetadataMap, idPrefix, inStockInchiKeys, route]
  )

  return (
    <FlowPanel
      nodes={graph.nodes as Node<RouteGraphNode>[]}
      edges={graph.edges as Edge[]}
    />
  )
}
