"use client"

import { useMemo } from "react"
import type { Edge, Node } from "@xyflow/react"
import type {
  BuyableMetadata,
  RouteGraphBuildOptions,
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
  graphOptions?: RouteGraphBuildOptions
  selectedNodeId?: string
  selectedEdgeId?: string
  onNodeSelect?: (nodeId: string, data: RouteGraphNode) => void
  onEdgeSelect?: (edgeId: string, data: Record<string, unknown>) => void
}

export function RouteGraph({
  route,
  inStockInchiKeys = new Set(),
  buyableMetadataMap,
  idPrefix = "route-",
  graphOptions,
  selectedNodeId,
  selectedEdgeId,
  onNodeSelect,
  onEdgeSelect,
}: RouteGraphProps) {
  const graph = useMemo(
    () =>
      buildRouteGraph(
        route,
        inStockInchiKeys,
        idPrefix,
        buyableMetadataMap,
        graphOptions
      ),
    [buyableMetadataMap, graphOptions, idPrefix, inStockInchiKeys, route]
  )

  return (
    <FlowPanel
      nodes={graph.nodes as Node<RouteGraphNode>[]}
      edges={graph.edges as Edge[]}
      selectedNodeId={selectedNodeId}
      selectedEdgeId={selectedEdgeId}
      onNodeSelect={onNodeSelect}
      onEdgeSelect={onEdgeSelect}
    />
  )
}
