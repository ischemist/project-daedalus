import type {
  RetrocastCandidate,
  RetrocastCandidatesByTarget,
  JsonObject,
  RetrocastRoute,
} from "@ischemist/routes"

export type WorkspaceRunDescriptor = {
  rootDir: string
  logbookPath: string
  retrocastExportPath: string
  runSlug: string
  family: string
  split: string
  prompt: string
  checkpointLabel: string
  scoreLabel: string
  benchmarkName: string
  processedCandidatesPath: string
  evaluationPath?: string
  analysisPath?: string
  manifestPath?: string
  ariadneMetadataPath?: string
}

export type RetrocastTaskConstraint = {
  kind: string
  [key: string]: unknown
}

export type BenchmarkTargetDefinition = {
  id: string
  smiles: string
  inchikey: string
  annotations?: JsonObject
  acceptable_routes: RetrocastRoute[]
  [key: string]: unknown
}

export type BenchmarkDefinition = {
  name: string
  description?: string
  targets: Record<string, BenchmarkTargetDefinition>
  default_constraints?: RetrocastTaskConstraint[]
  constraints?: Record<string, RetrocastTaskConstraint[]>
  metric_label?: string | null
  annotations?: JsonObject
  schema_version: "2"
  [key: string]: unknown
}

export type RetrocastScoredCandidate = RetrocastCandidate & {
  validity?: JsonObject
  constraints?: JsonObject
  matches_acceptable?: boolean
  matched_acceptable_index?: number | null
  [key: string]: unknown
}

export type RetrocastTargetEvaluation = {
  target: BenchmarkTargetDefinition
  effective_constraints: RetrocastTaskConstraint[]
  candidates: RetrocastScoredCandidate[]
  wall_time?: number | null
  cpu_time?: number | null
  [key: string]: unknown
}

export type RetrocastEvaluationFile = {
  task: BenchmarkDefinition
  tiers: number[]
  metric_label: string
  acceptable_match_level: string
  acceptable_route_match: "prefix" | "exact"
  targets: Record<string, RetrocastTargetEvaluation>
  schema_version: "2"
  [key: string]: unknown
}

export type MetricReliability = {
  code: string
  message: string
}

export type MetricEstimate = {
  value: number
  count: number
  ci_low?: number | null
  ci_high?: number | null
  reliability?: MetricReliability
  [key: string]: unknown
}

export type RetrocastAnalysisFile = {
  schema_version: "2"
  metrics: Record<string, MetricEstimate>
  by_stratum?: Record<string, Record<string, MetricEstimate>>
  bootstrap_resamples?: number | null
  runtime?: JsonObject
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
  candidatesByTarget: RetrocastCandidatesByTarget
  evaluation?: RetrocastEvaluationFile
  analysis?: RetrocastAnalysisFile
  manifest?: RetrocastManifestFile
  ariadneMetadata?: JsonObject
}

export type TargetAuditPrediction = {
  run: WorkspaceRunDescriptor
  candidates: RetrocastCandidate[]
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
  scoreLabel?: string
}
