export type JsonObject = Record<string, unknown>

export type RetrocastMolecule = {
  smiles: string
  inchikey: string
  product_of?: RetrocastReaction | null
  annotations?: JsonObject
}

export type RetrocastReaction = {
  reactants: RetrocastMolecule[]
  mapped_reaction_smiles?: string | null
  template?: string | null
  reagents?: string[] | null
  solvents?: string[] | null
  annotations?: JsonObject
}

export type RetrocastRoute = {
  target: RetrocastMolecule
  annotations?: JsonObject
  schema_version: "2"
}

export type RetrocastFailureRecord = {
  code: string
  message?: string | null
  target_id?: string | null
  target_smiles?: string | null
  target_inchikey?: string | null
  context?: JsonObject
}

type RetrocastCandidateRank = {
  rank: number
}

export type RetrocastRouteCandidate = RetrocastCandidateRank & {
  route: RetrocastRoute
  failure?: null
}

export type RetrocastFailureCandidate = RetrocastCandidateRank & {
  route?: null
  failure: RetrocastFailureRecord
}

export type RetrocastCandidate =
  | RetrocastRouteCandidate
  | RetrocastFailureCandidate

export type RetrocastCandidatesByTarget = Record<string, RetrocastCandidate[]>

export type RouteProjectionSource = {
  targetId?: string
  rank?: number
  annotations: JsonObject
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
  isConvergent: boolean
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

export type RouteInspectionNode = {
  ref: string
  molecule: {
    smiles: string
    inchikey: string
    metadata: JsonObject
  }
  depth: number
  children: RouteInspectionNode[]
  incomingStep?: {
    ref: string
    reactionSignature: string
    mappedSmiles: string | null
    template: string | null
    reagents: string[] | null
    solvents: string[] | null
    metadata: JsonObject
    isConvergent: boolean
  }
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
  badges?: RouteGraphNodeBadge[]
  [key: string]: unknown
}

export type RouteGraphNodeBadge = {
  label: string
  tone?: "neutral" | "success" | "warning" | "danger"
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
  routeNode?: RouteVisualizationNode
}

export type LayoutEdge = {
  source: string
  target: string
}

export type RouteGraphNodeContext = {
  node: LayoutNode
  routeNode?: RouteVisualizationNode
  status: NodeStatus
  inStock?: boolean
  isLeaf?: boolean
}

export type RouteGraphEdgeContext = {
  edge: LayoutEdge
  sourceNode?: LayoutNode
  targetNode?: LayoutNode
}

export type RouteGraphBuildOptions = {
  mapNodeData?: (context: RouteGraphNodeContext) => Partial<RouteGraphNode>
  mapEdgeData?: (context: RouteGraphEdgeContext) => Record<string, unknown>
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
  data?: Record<string, unknown>
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
