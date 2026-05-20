"use client"

import { useEffect } from "react"
import {
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react"
import type {
  Edge,
  EdgeMouseHandler,
  Node,
  NodeMouseHandler,
} from "@xyflow/react"
import type { RouteGraphNode } from "@ischemist/routes"

import { MoleculeNode } from "./molecule-node.js"

import "@xyflow/react/dist/style.css"

const nodeTypes = {
  molecule: MoleculeNode,
}

const flowPanelStyles = `
  .ischemist-route-viewer-node {
    --ischemist-route-node-bg: var(--background, #ffffff);
    --ischemist-route-node-border-default: rgb(203 213 225 / 0.72);
    --ischemist-route-node-border-ghost: rgb(148 163 184 / 0.74);
    --ischemist-route-node-shadow: 0 1px 2px rgb(15 23 42 / 0.08);
  }

  .dark .ischemist-route-viewer-node {
    --ischemist-route-node-bg: color-mix(in oklch, var(--background, #09090b) 94%, white);
    --ischemist-route-node-border-default: rgb(148 163 184 / 0.35);
    --ischemist-route-node-border-ghost: rgb(148 163 184 / 0.45);
    --ischemist-route-node-shadow: 0 1px 2px rgb(0 0 0 / 0.28);
  }

  .ischemist-route-viewer-controls.react-flow__controls {
    background: var(--popover, var(--background, #ffffff));
    border: 1px solid rgb(148 163 184 / 0.28);
    box-shadow: 0 8px 22px rgb(15 23 42 / 0.12);
  }

  .ischemist-route-viewer-controls .react-flow__controls-button {
    background: var(--popover, var(--background, #ffffff));
    border-bottom: 1px solid rgb(148 163 184 / 0.24);
    color: var(--popover-foreground, var(--foreground, #111827));
    fill: currentColor;
  }

  .ischemist-route-viewer-controls .react-flow__controls-button:hover {
    background: color-mix(in oklch, var(--foreground, #111827) 7%, transparent);
  }

  .ischemist-route-viewer-controls .react-flow__controls-button svg {
    color: inherit;
    fill: currentColor;
  }

  .ischemist-route-viewer-controls .react-flow__controls-button:last-child {
    border-bottom: 0;
  }

  .react-flow__attribution {
    background: var(--popover, var(--background, #ffffff));
    color: color-mix(in oklch, var(--foreground, #111827) 58%, transparent);
    border: 1px solid rgb(148 163 184 / 0.22);
    border-radius: 6px 0 0 0;
    font-size: 10px;
  }

  .react-flow__attribution a {
    color: inherit;
    text-decoration: none;
  }

  .react-flow__attribution a:hover {
    color: var(--foreground, #111827);
  }
`

export type FlowPanelProps = {
  nodes: Node<RouteGraphNode>[]
  edges: Edge[]
  title?: string
  selectedNodeId?: string
  selectedEdgeId?: string
  onNodeSelect?: (nodeId: string, data: RouteGraphNode) => void
  onEdgeSelect?: (edgeId: string, data: Record<string, unknown>) => void
}

function applyNodeSelection(
  nodes: Node<RouteGraphNode>[],
  selectedNodeId: string | undefined
): Node<RouteGraphNode>[] {
  return nodes.map((node) => ({
    ...node,
    selected: selectedNodeId ? node.id === selectedNodeId : node.selected,
  }))
}

function applyEdgeSelection(
  edges: Edge[],
  selectedEdgeId: string | undefined
): Edge[] {
  return edges.map((edge) => ({
    ...edge,
    selected: selectedEdgeId ? edge.id === selectedEdgeId : edge.selected,
  }))
}

export function FlowPanel({
  nodes: initialNodes,
  edges: initialEdges,
  title,
  selectedNodeId,
  selectedEdgeId,
  onNodeSelect,
  onEdgeSelect,
}: FlowPanelProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    applyNodeSelection(initialNodes, selectedNodeId)
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    applyEdgeSelection(initialEdges, selectedEdgeId)
  )

  useEffect(() => {
    setNodes(applyNodeSelection(initialNodes, selectedNodeId))
    setEdges(applyEdgeSelection(initialEdges, selectedEdgeId))
  }, [
    initialEdges,
    initialNodes,
    selectedEdgeId,
    selectedNodeId,
    setEdges,
    setNodes,
  ])

  const handleNodeClick: NodeMouseHandler<Node<RouteGraphNode>> = (_, node) => {
    onNodeSelect?.(node.id, node.data)
  }
  const handleEdgeClick: EdgeMouseHandler = (_, edge) => {
    onEdgeSelect?.(edge.id, (edge.data ?? {}) as Record<string, unknown>)
  }
  const elementsSelectable =
    Boolean(selectedNodeId) ||
    Boolean(selectedEdgeId) ||
    Boolean(onNodeSelect) ||
    Boolean(onEdgeSelect)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 360,
      }}
    >
      {title ? (
        <div
          style={{
            background: "rgb(148 163 184 / 0.1)",
            borderBottom: "1px solid rgb(148 163 184 / 0.24)",
            fontSize: 13,
            fontWeight: 650,
            padding: "8px 12px",
          }}
        >
          {title}
        </div>
      ) : null}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2, minZoom: 0.1, maxZoom: 4 }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable={elementsSelectable}
        >
          <style>{flowPanelStyles}</style>
          <Background color="#cbd5e1" gap={16} />
          <Controls
            className="ischemist-route-viewer-controls"
            showInteractive={false}
          />
        </ReactFlow>
      </div>
    </div>
  )
}
