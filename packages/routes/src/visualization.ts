import type {
  BuyableMetadata,
  FlowEdge,
  FlowNode,
  LayoutEdge,
  LayoutNode,
  MergedRouteNode,
  NodeStatus,
  RouteGraph,
  RouteGraphNode,
  RouteLayout,
  RouteVisualizationNode,
} from "./types.js"

export const NODE_WIDTH = 150
export const NODE_HEIGHT = 60
export const HORIZONTAL_SPACING = 30
export const VERTICAL_SPACING = 160

export const LAYOUT_CONFIG = Object.freeze({
  nodeWidth: NODE_WIDTH,
  nodeHeight: NODE_HEIGHT,
  horizontalSpacing: HORIZONTAL_SPACING,
  verticalSpacing: VERTICAL_SPACING,
})

type InternalLayoutNode = {
  id: string
  smiles: string
  inchikey: string
  children: InternalLayoutNode[]
  width?: number
  x?: number
  y?: number
}

type InternalLayoutNodeWithStatus = InternalLayoutNode & {
  status: NodeStatus
  children: InternalLayoutNodeWithStatus[]
}

type OverlayRouteNode = {
  smiles: string
  inchikey: string
  routeIndexes: Set<number>
  children: Map<string, OverlayRouteNode>
}

type InternalOverlayLayoutNode = InternalLayoutNode & {
  status: NodeStatus
  routeCount: number
  routeTotal: number
  children: InternalOverlayLayoutNode[]
}

type RouteTopology = {
  inchikeys: Set<string>
  edges: Set<string>
}

function routeEdgeKey(parentInchikey: string, childInchikey: string): string {
  return `${parentInchikey}->${childInchikey}`
}

function buildRouteTopology(
  node: RouteVisualizationNode,
  topology: RouteTopology = { inchikeys: new Set(), edges: new Set() },
  parentInchikey?: string
): RouteTopology {
  topology.inchikeys.add(node.inchikey)

  if (parentInchikey) {
    topology.edges.add(routeEdgeKey(parentInchikey, node.inchikey))
  }

  for (const child of node.children ?? []) {
    buildRouteTopology(child, topology, node.inchikey)
  }

  return topology
}

function buildLayoutTree(
  node: RouteVisualizationNode,
  idPrefix: string
): InternalLayoutNode {
  const nodeId = `${idPrefix}${node.smiles}`
  return {
    id: nodeId,
    smiles: node.smiles,
    inchikey: node.inchikey,
    children: (node.children ?? []).map((child, index) =>
      buildLayoutTree(child, `${nodeId}-${index}-`)
    ),
  }
}

function calculateSubtreeWidth(node: InternalLayoutNode): number {
  if (node.children.length === 0) {
    node.width = NODE_WIDTH
    return NODE_WIDTH
  }

  const childrenWidth = node.children.reduce(
    (sum, child) => sum + calculateSubtreeWidth(child),
    0
  )
  const totalChildrenWidth =
    childrenWidth + (node.children.length - 1) * HORIZONTAL_SPACING

  node.width = Math.max(NODE_WIDTH, totalChildrenWidth)
  return node.width
}

function assignPositions(node: InternalLayoutNode, x: number, y: number): void {
  node.x = x + ((node.width ?? NODE_WIDTH) - NODE_WIDTH) / 2
  node.y = y

  let currentX = x
  for (const child of node.children) {
    assignPositions(child, currentX, y + NODE_HEIGHT + VERTICAL_SPACING)
    currentX += (child.width ?? NODE_WIDTH) + HORIZONTAL_SPACING
  }
}

function flattenLayoutTree(
  node: InternalLayoutNode,
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  parentId: string | null
): void {
  nodes.push({
    id: node.id,
    smiles: node.smiles,
    inchikey: node.inchikey,
    x: node.x ?? 0,
    y: node.y ?? 0,
  })

  if (parentId) {
    edges.push({ source: parentId, target: node.id })
  }

  for (const child of node.children) {
    flattenLayoutTree(child, nodes, edges, node.id)
  }
}

export function layoutTree(
  root: RouteVisualizationNode,
  idPrefix: string
): RouteLayout {
  const layoutRoot = buildLayoutTree(root, idPrefix)
  calculateSubtreeWidth(layoutRoot)
  assignPositions(layoutRoot, 0, 0)

  const nodes: LayoutNode[] = []
  const edges: LayoutEdge[] = []
  flattenLayoutTree(layoutRoot, nodes, edges, null)

  return { nodes, edges }
}

export function collectInchiKeys(
  node: RouteVisualizationNode,
  set = new Set<string>()
): Set<string> {
  set.add(node.inchikey)
  for (const child of node.children ?? []) {
    collectInchiKeys(child, set)
  }
  return set
}

export function collectSmiles(
  node: RouteVisualizationNode,
  set = new Set<string>()
): Set<string> {
  set.add(node.smiles)
  for (const child of node.children ?? []) {
    collectSmiles(child, set)
  }
  return set
}

function toFlowEdges(edges: LayoutEdge[], idPrefix: string): FlowEdge[] {
  return edges.map((edge, index) => ({
    id: `${idPrefix}edge-${index}`,
    source: edge.source,
    target: edge.target,
    animated: false,
    style: { stroke: "#94a3b8", strokeWidth: 2 },
  }))
}

function buildLeafNodeSet(
  edges: LayoutEdge[],
  nodes: LayoutNode[]
): Set<string> {
  const parents = new Set(edges.map((edge) => edge.source))
  return new Set(
    nodes.filter((node) => !parents.has(node.id)).map((node) => node.id)
  )
}

function metadataFor(
  buyableMetadataMap: Map<string, BuyableMetadata> | undefined,
  inchikey: string
): BuyableMetadata | undefined {
  return buyableMetadataMap?.get(inchikey)
}

function createGraphNode(
  node: LayoutNode,
  status: NodeStatus,
  inStockInchiKeys: Set<string> | undefined,
  buyableMetadataMap: Map<string, BuyableMetadata> | undefined,
  isLeaf?: boolean
): FlowNode<RouteGraphNode> {
  const metadata = metadataFor(buyableMetadataMap, node.inchikey)
  const inStock = inStockInchiKeys?.has(node.inchikey)

  return {
    id: node.id,
    type: "molecule",
    position: { x: node.x, y: node.y },
    data: {
      smiles: node.smiles,
      inchikey: node.inchikey,
      status,
      inStock,
      isLeaf,
      ppg: metadata?.ppg,
      source: metadata?.source,
      leadTime: metadata?.leadTime,
      link: metadata?.link,
    },
  }
}

export function buildRouteGraph(
  route: RouteVisualizationNode,
  inStockInchiKeys: Set<string> = new Set(),
  idPrefix = "route-",
  buyableMetadataMap?: Map<string, BuyableMetadata>
): RouteGraph {
  const layout = layoutTree(route, idPrefix)
  return {
    nodes: layout.nodes.map((node) =>
      createGraphNode(node, "default", inStockInchiKeys, buyableMetadataMap)
    ),
    edges: toFlowEdges(layout.edges, idPrefix),
  }
}

function overlayStatus(routeCount: number, routeTotal: number): NodeStatus {
  if (routeCount === routeTotal) return "overlay-all"
  if (routeCount > 1) return "overlay-some"
  return "overlay-one"
}

function mergeOverlayNode(
  target: OverlayRouteNode,
  source: RouteVisualizationNode,
  routeIndex: number
): void {
  target.routeIndexes.add(routeIndex)

  for (const child of source.children ?? []) {
    const key = child.inchikey
    const existing = target.children.get(key)

    if (existing) {
      mergeOverlayNode(existing, child, routeIndex)
      continue
    }

    const childNode: OverlayRouteNode = {
      smiles: child.smiles,
      inchikey: child.inchikey,
      routeIndexes: new Set(),
      children: new Map(),
    }

    target.children.set(key, childNode)
    mergeOverlayNode(childNode, child, routeIndex)
  }
}

function buildOverlayTree(
  routes: RouteVisualizationNode[]
): OverlayRouteNode | null {
  const [root] = routes
  if (!root) {
    return null
  }

  const overlayRoot: OverlayRouteNode = {
    smiles: root.smiles,
    inchikey: root.inchikey,
    routeIndexes: new Set(),
    children: new Map(),
  }

  routes.forEach((route, routeIndex) => {
    mergeOverlayNode(overlayRoot, route, routeIndex)
  })

  return overlayRoot
}

function buildOverlayLayoutTree(
  node: OverlayRouteNode,
  idPrefix: string,
  routeTotal: number
): InternalOverlayLayoutNode {
  const nodeId = `${idPrefix}${node.smiles}`
  const routeCount = node.routeIndexes.size

  return {
    id: nodeId,
    smiles: node.smiles,
    inchikey: node.inchikey,
    status: overlayStatus(routeCount, routeTotal),
    routeCount,
    routeTotal,
    children: Array.from(node.children.values()).map((child, index) =>
      buildOverlayLayoutTree(child, `${nodeId}-${index}-`, routeTotal)
    ),
  }
}

function flattenOverlayLayoutTree(
  node: InternalOverlayLayoutNode,
  nodes: Array<
    LayoutNode & {
      status: NodeStatus
      routeCount: number
      routeTotal: number
      isLeaf: boolean
    }
  >,
  edges: LayoutEdge[],
  parentId: string | null
): void {
  nodes.push({
    id: node.id,
    smiles: node.smiles,
    inchikey: node.inchikey,
    x: node.x ?? 0,
    y: node.y ?? 0,
    status: node.status,
    routeCount: node.routeCount,
    routeTotal: node.routeTotal,
    isLeaf: node.children.length === 0,
  })

  if (parentId) {
    edges.push({ source: parentId, target: node.id })
  }

  for (const child of node.children) {
    flattenOverlayLayoutTree(child, nodes, edges, node.id)
  }
}

export function buildRouteOverlayGraph(
  routes: RouteVisualizationNode[],
  inStockInchiKeys: Set<string> = new Set(),
  idPrefix = "overlay_",
  buyableMetadataMap?: Map<string, BuyableMetadata>
): RouteGraph {
  const overlayTree = buildOverlayTree(routes)
  if (!overlayTree) {
    return { nodes: [], edges: [] }
  }

  const layoutRoot = buildOverlayLayoutTree(
    overlayTree,
    idPrefix,
    routes.length
  )
  calculateSubtreeWidth(layoutRoot)
  assignPositions(layoutRoot, 0, 0)

  const layoutNodes: Array<
    LayoutNode & {
      status: NodeStatus
      routeCount: number
      routeTotal: number
      isLeaf: boolean
    }
  > = []
  const layoutEdges: LayoutEdge[] = []
  flattenOverlayLayoutTree(layoutRoot, layoutNodes, layoutEdges, null)

  return {
    nodes: layoutNodes.map((node) => {
      const graphNode = createGraphNode(
        node,
        node.status,
        inStockInchiKeys,
        buyableMetadataMap,
        node.isLeaf
      )

      return {
        ...graphNode,
        data: {
          ...graphNode.data,
          routeCount: node.routeCount,
          routeTotal: node.routeTotal,
        },
      }
    }),
    edges: toFlowEdges(layoutEdges, idPrefix),
  }
}

export function getAllRouteInchiKeysSet(
  route: RouteVisualizationNode
): Set<string> {
  return collectInchiKeys(route)
}

export function buildSideBySideGraph(
  route: RouteVisualizationNode,
  acceptableRouteOrInchiKeys: RouteVisualizationNode | Set<string>,
  isAcceptableRoute: boolean,
  idPrefix: string,
  inStockInchiKeys?: Set<string>,
  buyableMetadataMap?: Map<string, BuyableMetadata>,
  comparedRoute?: RouteVisualizationNode
): RouteGraph {
  const layout = layoutTree(route, idPrefix)
  const leafNodeIds = buildLeafNodeSet(layout.edges, layout.nodes)
  const nodeById = new Map(layout.nodes.map((node) => [node.id, node]))
  const parentByNodeId = new Map(
    layout.edges.map((edge) => [edge.target, edge.source])
  )
  const acceptableTopology =
    acceptableRouteOrInchiKeys instanceof Set
      ? { inchikeys: acceptableRouteOrInchiKeys, edges: new Set<string>() }
      : buildRouteTopology(acceptableRouteOrInchiKeys)
  const comparedTopology = comparedRoute
    ? buildRouteTopology(comparedRoute)
    : undefined

  const nodes = layout.nodes.map((node) => {
    const parentId = parentByNodeId.get(node.id)
    const parent = parentId ? nodeById.get(parentId) : undefined
    const edgeKey = parent ? routeEdgeKey(parent.inchikey, node.inchikey) : null
    let status: NodeStatus

    if (isAcceptableRoute) {
      status =
        comparedTopology &&
        (!comparedTopology.inchikeys.has(node.inchikey) ||
          (edgeKey != null && !comparedTopology.edges.has(edgeKey)))
          ? "ghost"
          : "match"
    } else {
      status =
        !acceptableTopology.inchikeys.has(node.inchikey) ||
        (edgeKey != null &&
          acceptableTopology.edges.size > 0 &&
          !acceptableTopology.edges.has(edgeKey))
          ? "extension"
          : "match"
    }

    return createGraphNode(
      node,
      status,
      inStockInchiKeys,
      buyableMetadataMap,
      leafNodeIds.has(node.id)
    )
  })

  return { nodes, edges: toFlowEdges(layout.edges, idPrefix) }
}

function mergeTreesForDiff(
  acceptableNode: RouteVisualizationNode | null,
  predNode: RouteVisualizationNode | null
): MergedRouteNode | null {
  if (!acceptableNode && !predNode) {
    return null
  }

  const smiles = predNode?.smiles ?? acceptableNode?.smiles
  const inchikey = predNode?.inchikey ?? acceptableNode?.inchikey
  if (!smiles || !inchikey) {
    return null
  }

  const status: NodeStatus =
    acceptableNode && predNode ? "match" : predNode ? "extension" : "ghost"

  const acceptableChildren = acceptableNode?.children ?? []
  const predChildren = predNode?.children ?? []
  const mergedChildrenMap = new Map<string, MergedRouteNode>()

  for (const child of predChildren) {
    const acceptableMatch = acceptableChildren.find(
      (candidate) => candidate.inchikey === child.inchikey
    )
    const merged = mergeTreesForDiff(acceptableMatch ?? null, child)
    if (merged) {
      mergedChildrenMap.set(child.inchikey, merged)
    }
  }

  for (const child of acceptableChildren) {
    if (!mergedChildrenMap.has(child.inchikey)) {
      const merged = mergeTreesForDiff(child, null)
      if (merged) {
        mergedChildrenMap.set(child.inchikey, merged)
      }
    }
  }

  return {
    smiles,
    inchikey,
    status,
    children: Array.from(mergedChildrenMap.values()),
  }
}

function buildMergedLayoutTree(
  node: MergedRouteNode,
  idPrefix: string
): InternalLayoutNodeWithStatus {
  const nodeId = `${idPrefix}${node.smiles}`
  return {
    id: nodeId,
    smiles: node.smiles,
    inchikey: node.inchikey,
    status: node.status,
    children: node.children.map((child) =>
      buildMergedLayoutTree(child, `${nodeId}-`)
    ),
  }
}

function flattenMergedLayoutTree(
  node: InternalLayoutNodeWithStatus,
  nodes: Array<LayoutNode & { status: NodeStatus; isLeaf: boolean }>,
  edges: Array<LayoutEdge & { isGhost: boolean }>,
  parentId: string | null,
  parentIsGhost: boolean
): void {
  const isDashed = node.status === "ghost" || node.status === "pred-2-only"
  const isLeaf = node.children.length === 0
  nodes.push({
    id: node.id,
    smiles: node.smiles,
    inchikey: node.inchikey,
    x: node.x ?? 0,
    y: node.y ?? 0,
    status: node.status,
    isLeaf,
  })

  if (parentId) {
    edges.push({
      source: parentId,
      target: node.id,
      isGhost: isDashed || parentIsGhost,
    })
  }

  for (const child of node.children) {
    flattenMergedLayoutTree(child, nodes, edges, node.id, isDashed)
  }
}

function buildMergedGraph(
  mergedTree: MergedRouteNode,
  idPrefix: string,
  edgePrefix: string,
  inStockInchiKeys?: Set<string>,
  buyableMetadataMap?: Map<string, BuyableMetadata>
): RouteGraph {
  const layoutRoot = buildMergedLayoutTree(mergedTree, idPrefix)
  calculateSubtreeWidth(layoutRoot)
  assignPositions(layoutRoot, 0, 0)

  const layoutNodes: Array<
    LayoutNode & { status: NodeStatus; isLeaf: boolean }
  > = []
  const layoutEdges: Array<LayoutEdge & { isGhost: boolean }> = []
  flattenMergedLayoutTree(layoutRoot, layoutNodes, layoutEdges, null, false)
  const solidEdgeStyle: Record<string, string | number> = {
    stroke: "#94a3b8",
    strokeWidth: 2,
  }
  const ghostEdgeStyle: Record<string, string | number> = {
    stroke: "#9ca3af",
    strokeWidth: 2,
    strokeDasharray: "5,5",
  }

  return {
    nodes: layoutNodes.map((node) =>
      createGraphNode(
        node,
        node.status,
        inStockInchiKeys,
        buyableMetadataMap,
        node.isLeaf
      )
    ),
    edges: layoutEdges.map((edge, index) => ({
      id: `${edgePrefix}${index}`,
      source: edge.source,
      target: edge.target,
      animated: false,
      style: edge.isGhost ? ghostEdgeStyle : solidEdgeStyle,
    })),
  }
}

export function buildDiffOverlayGraph(
  acceptableRoute: RouteVisualizationNode,
  predRoute: RouteVisualizationNode,
  inStockInchiKeys?: Set<string>,
  buyableMetadataMap?: Map<string, BuyableMetadata>
): RouteGraph {
  const mergedTree = mergeTreesForDiff(acceptableRoute, predRoute)

  if (!mergedTree) {
    return { nodes: [], edges: [] }
  }

  return buildMergedGraph(
    mergedTree,
    "diff_",
    "diff-edge-",
    inStockInchiKeys,
    buyableMetadataMap
  )
}

export function buildPredictionSideBySideGraph(
  route: RouteVisualizationNode,
  otherRouteInchiKeys: Set<string>,
  isFirstRoute: boolean,
  idPrefix: string,
  inStockInchiKeys?: Set<string>,
  buyableMetadataMap?: Map<string, BuyableMetadata>
): RouteGraph {
  const layout = layoutTree(route, idPrefix)
  const leafNodeIds = buildLeafNodeSet(layout.edges, layout.nodes)

  return {
    nodes: layout.nodes.map((node) =>
      createGraphNode(
        node,
        otherRouteInchiKeys.has(node.inchikey)
          ? "pred-shared"
          : isFirstRoute
            ? "pred-1-only"
            : "pred-2-only",
        inStockInchiKeys,
        buyableMetadataMap,
        leafNodeIds.has(node.id)
      )
    ),
    edges: toFlowEdges(layout.edges, idPrefix),
  }
}

function mergeTreesForPredDiff(
  pred1Node: RouteVisualizationNode | null,
  pred2Node: RouteVisualizationNode | null
): MergedRouteNode | null {
  if (!pred1Node && !pred2Node) {
    return null
  }

  const smiles = pred1Node?.smiles ?? pred2Node?.smiles
  const inchikey = pred1Node?.inchikey ?? pred2Node?.inchikey
  if (!smiles || !inchikey) {
    return null
  }

  const status: NodeStatus =
    pred1Node && pred2Node
      ? "pred-shared"
      : pred1Node
        ? "pred-1-only"
        : "pred-2-only"

  const pred1Children = pred1Node?.children ?? []
  const pred2Children = pred2Node?.children ?? []
  const mergedChildrenMap = new Map<string, MergedRouteNode>()

  for (const child of pred1Children) {
    const pred2Match = pred2Children.find(
      (candidate) => candidate.inchikey === child.inchikey
    )
    const merged = mergeTreesForPredDiff(child, pred2Match ?? null)
    if (merged) {
      mergedChildrenMap.set(child.inchikey, merged)
    }
  }

  for (const child of pred2Children) {
    if (!mergedChildrenMap.has(child.inchikey)) {
      const merged = mergeTreesForPredDiff(null, child)
      if (merged) {
        mergedChildrenMap.set(child.inchikey, merged)
      }
    }
  }

  return {
    smiles,
    inchikey,
    status,
    children: Array.from(mergedChildrenMap.values()),
  }
}

export function buildPredictionDiffOverlayGraph(
  pred1Route: RouteVisualizationNode,
  pred2Route: RouteVisualizationNode,
  inStockInchiKeys?: Set<string>,
  buyableMetadataMap?: Map<string, BuyableMetadata>
): RouteGraph {
  const mergedTree = mergeTreesForPredDiff(pred1Route, pred2Route)

  if (!mergedTree) {
    return { nodes: [], edges: [] }
  }

  return buildMergedGraph(
    mergedTree,
    "diff_pred_",
    "diff-pred-edge-",
    inStockInchiKeys,
    buyableMetadataMap
  )
}
