import type {
  JsonObject,
  RetrocastRoute,
  RetrocastRoutesByTarget,
} from "@ischemist/routes"

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[]

export type WorkspaceRunDescriptor = {
  rootDir: string
  logbookPath: string
  retrocastExportPath: string
  runSlug: string
  family: string
  split: string
  prompt: string
  checkpointLabel: string
  stockKey: string
  benchmarkName: string
  processedRoutesPath: string
  evaluationPath?: string
  statisticsPath?: string
  manifestPath?: string
  ariadneMetadataPath?: string
}

export type BenchmarkTargetDefinition = {
  id: string
  smiles: string
  inchi_key?: string
  inchikey?: string
  metadata?: JsonObject
  acceptable_routes: RetrocastRoute[]
  [key: string]: unknown
}

export type BenchmarkDefinition = {
  name: string
  description?: string
  stock_name?: string
  targets: Record<string, BenchmarkTargetDefinition>
  [key: string]: unknown
}

export type RetrocastRouteEvaluation = {
  rank: number
  is_solved?: boolean
  matches_acceptable?: boolean
  matched_acceptable_index?: number | null
  [key: string]: unknown
}

export type RetrocastTargetEvaluation = {
  target_id: string
  routes: RetrocastRouteEvaluation[]
  [key: string]: unknown
}

export type RetrocastEvaluationFile = {
  model_name: string
  benchmark_name: string
  stock_name: string
  has_acceptable_routes?: boolean
  results: Record<string, RetrocastTargetEvaluation>
  [key: string]: unknown
}

export type MetricReliability = {
  code: string
  message: string
}

export type MetricEstimate = {
  value: number
  ci_lower?: number
  ci_upper?: number
  n_samples?: number
  reliability?: MetricReliability
  [key: string]: unknown
}

export type StratifiedMetric = {
  metric_name: string
  overall: MetricEstimate
  by_group?: Record<string, MetricEstimate>
  [key: string]: unknown
}

export type RetrocastStatisticsFile = {
  model_name?: string
  benchmark?: string
  benchmark_name?: string
  stock?: string
  stock_name?: string
  solvability?: StratifiedMetric
  top_k_accuracy?: Record<string, StratifiedMetric>
  [key: string]: unknown
}

export type RetrocastManifestFile = {
  schema_version?: string
  retrocast_version?: string
  created_at?: string
  action?: string
  parameters?: JsonObject
  directives?: JsonObject
  release_name?: string | null
  source_files?: JsonObject[]
  output_files?: JsonObject[]
  statistics?: JsonObject
  summary?: JsonObject
  [key: string]: unknown
}

export type RetrocastCheckpointBundle = {
  descriptor: WorkspaceRunDescriptor
  benchmark?: BenchmarkDefinition
  routesByTarget: RetrocastRoutesByTarget
  evaluation?: RetrocastEvaluationFile
  statistics?: RetrocastStatisticsFile
  manifest?: RetrocastManifestFile
  ariadneMetadata?: JsonObject
}

export type TargetAuditPrediction = {
  run: WorkspaceRunDescriptor
  routes: RetrocastRoute[]
  evaluation?: RetrocastTargetEvaluation
}

export type TargetAuditBundle = {
  targetId: string
  benchmarkTarget?: BenchmarkTargetDefinition
  acceptableRoutes: RetrocastRoute[]
  predictions: TargetAuditPrediction[]
}

export type ScanAriadneWorkspaceOptions = {
  includeArchive?: boolean
}

export type LoadBenchmarkDefinitionOptions = {
  rootDir?: string
  benchmarkDefinitionsDir?: string
}

export type LoadTargetAuditBundleOptions = {
  rootDir: string
  targetId: string
  descriptors?: WorkspaceRunDescriptor[]
  benchmarkName?: string
  stockKey?: string
}
