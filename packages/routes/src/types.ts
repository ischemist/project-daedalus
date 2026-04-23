export type JsonObject = Record<string, unknown>

export type RetrocastMolecule = {
  smiles: string
  inchikey: string
  synthesis_step: RetrocastReactionStep | null
  metadata?: JsonObject
  is_leaf?: boolean
}

export type RetrocastReactionStep = {
  reactants: RetrocastMolecule[]
  mapped_smiles?: string | null
  template?: string | null
  reagents?: string[] | null
  solvents?: string[] | null
  metadata?: JsonObject
  is_convergent?: boolean
}

export type RetrocastRoute = {
  target: RetrocastMolecule
  rank?: number
  metadata?: JsonObject
  retrocast_version?: string
  length?: number
  has_convergent_reaction?: boolean
  content_hash?: string
  signature?: string
  leaves?: RetrocastMolecule[]
}

export type RetrocastRoutesByTarget = Record<string, RetrocastRoute[]>

export type RouteProjectionSource = {
  targetId?: string
  rank?: number
  retrocastVersion?: string
  metadata: JsonObject
  sourceSignature?: string
  sourceContentHash?: string
}

export type ProjectedMolecule = {
  inchikey: string
  smiles: string
  metadata: JsonObject
}

export type ProjectedReaction = {
  ref: string
  signature: string
  productInchikey: string
}

export type ProjectedReactionInput = {
  reactionRef: string
  moleculeInchikey: string
  position: number
  stoichiometry: number
}

export type ProjectedRoute = {
  signature: string
  computedSignature: string
  rootMoleculeInchikey: string
  rootNodeRef: string
  length: number
  hasConvergentReaction: boolean
  source: RouteProjectionSource
}

export type ProjectedRouteNode = {
  ref: string
  moleculeInchikey: string
  nodeIndex: number
  depth: number
  subtreeSignature: string
}

export type ProjectedRouteStep = {
  ref: string
  reactionRef: string
  productNodeRef: string
  stepIndex: number
  mappedSmiles: string | null
  template: string | null
  reagents: string[] | null
  solvents: string[] | null
  metadata: JsonObject
}

export type ProjectedRouteStepInput = {
  routeStepRef: string
  routeNodeRef: string
  position: number
}

export type RouteProjectionRecords = {
  molecules: ProjectedMolecule[]
  reactions: ProjectedReaction[]
  reactionInputs: ProjectedReactionInput[]
  route: ProjectedRoute
  nodes: ProjectedRouteNode[]
  steps: ProjectedRouteStep[]
  stepInputs: ProjectedRouteStepInput[]
}

export type RouteProjection = RouteProjectionRecords & {
  visualizationTree: RouteVisualizationNode
}

export type RouteVisualizationNode = {
  smiles: string
  inchikey: string
  children?: RouteVisualizationNode[]
}

export type VendorSource =
  | "MCULE"
  | "LABNETWORK"
  | "EMOLECULES"
  | "SIGMA_ALDRICH"
  | "CHEMBRIDGE"
  | "MC"
  | "LN"
  | "EM"
  | "SA"
  | "CB"

export type BuyableMetadata = {
  ppg: number | null
  source: VendorSource | null
  leadTime: string | null
  link: string | null
}

export type NodeStatus =
  | "in-stock"
  | "default"
  | "match"
  | "extension"
  | "ghost"
  | "pred-shared"
  | "pred-1-only"
  | "pred-2-only"
  | "overlay-all"
  | "overlay-some"
  | "overlay-one"

export type RouteGraphNode = {
  smiles: string
  inchikey: string
  status: NodeStatus
  inStock?: boolean
  isLeaf?: boolean
  ppg?: number | null
  source?: VendorSource | null
  leadTime?: string | null
  link?: string | null
  routeCount?: number
  routeTotal?: number
  [key: string]: unknown
}

export const ROUTE_LAYOUT_MODES = [
  "prediction-only",
  "side-by-side",
  "diff-overlay",
] as const

export const COMPARISON_LAYOUT_MODES = ["side-by-side", "diff-overlay"] as const

export type RouteLayoutMode = (typeof ROUTE_LAYOUT_MODES)[number]
export type ComparisonLayoutMode = (typeof COMPARISON_LAYOUT_MODES)[number]

export type RouteLayoutConfig = {
  nodeWidth: number
  nodeHeight: number
  horizontalSpacing: number
  verticalSpacing: number
}

export type LayoutNode = {
  id: string
  smiles: string
  inchikey: string
  x: number
  y: number
}

export type LayoutEdge = {
  source: string
  target: string
}

export type RouteLayout = {
  nodes: LayoutNode[]
  edges: LayoutEdge[]
}

export type FlowPosition = {
  x: number
  y: number
}

export type FlowNode<TData extends object = RouteGraphNode> = {
  id: string
  type?: string
  position: FlowPosition
  data: TData
}

export type FlowEdge = {
  id: string
  source: string
  target: string
  animated?: boolean
  style?: Record<string, string | number>
}

export type RouteGraph = {
  nodes: FlowNode<RouteGraphNode>[]
  edges: FlowEdge[]
}

export type MergedRouteNode = {
  smiles: string
  inchikey: string
  status: NodeStatus
  children: MergedRouteNode[]
}
