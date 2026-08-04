import type {
  JsonObject,
  RetrocastCandidate,
  RetrocastCandidatesByTarget,
  RetrocastFailureRecord,
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
  annotations: JsonObject
  acceptable_routes: RetrocastRoute[]
}

export type BenchmarkDefinition = {
  name: string
  description?: string
  targets: Record<string, BenchmarkTargetDefinition>
  default_constraints: RetrocastTaskConstraint[]
  constraints: Record<string, RetrocastTaskConstraint[]>
  metric_label: string | null
  annotations: JsonObject
  schema_version: "2"
}

export const RETROCAST_TIERS = [0, 1, 2, 3] as const
export type RetrocastTier = (typeof RETROCAST_TIERS)[number]

export const RETROCAST_CHECK_STATUSES = [
  "pass",
  "fail",
  "not_evaluated",
] as const
export type RetrocastCheckStatus = (typeof RETROCAST_CHECK_STATUSES)[number]

export type RetrocastCheckResult = {
  code: string
  status: RetrocastCheckStatus
  message: string | null
  details: JsonObject
}

export type RetrocastTierResult = {
  status: RetrocastCheckStatus
  checks: RetrocastCheckResult[]
}

export type RetrocastReactionValidity = {
  reaction_id: string
  tiers: Partial<Record<`${RetrocastTier}`, RetrocastTierResult>>
}

export type RetrocastObligationAssessment = JsonObject & {
  claim: JsonObject
  evaluation: JsonObject
  receipts: JsonObject[]
}

export type RetrocastReactionAssessment = JsonObject & {
  reaction_id: string
  semantics_id: string
  identities: JsonObject
  coverage: JsonObject
  obligations: RetrocastObligationAssessment[]
  closest_reference: JsonObject | null
}

export type RetrocastAssessmentRouteBinding = JsonObject & {
  profile_id: string
  sha256: string
}

export type RetrocastRouteValidity = {
  tiers: Partial<Record<`${RetrocastTier}`, RetrocastTierResult>>
  reactions: RetrocastReactionValidity[]
  reaction_assessments?: RetrocastReactionAssessment[]
  molecule_assessments?: RetrocastObligationAssessment[]
  route_assessments?: RetrocastObligationAssessment[]
  assessment_route_binding?: RetrocastAssessmentRouteBinding | null
  [key: string]: unknown
}

export type RetrocastConstraintResult = {
  status: RetrocastCheckStatus
  checks: RetrocastCheckResult[]
}

type RetrocastScoredCandidateFields = {
  rank: number
  validity: RetrocastRouteValidity
  constraints: RetrocastConstraintResult
  matches_acceptable: boolean
  matched_acceptable_index: number | null
}

export type RetrocastScoredRouteCandidate = RetrocastScoredCandidateFields & {
  route: RetrocastRoute
  failure?: null
}

export type RetrocastScoredFailureCandidate = RetrocastScoredCandidateFields & {
  route?: null
  failure: RetrocastFailureRecord
}

export type RetrocastScoredCandidate =
  | RetrocastScoredRouteCandidate
  | RetrocastScoredFailureCandidate

export type RetrocastTargetEvaluation = {
  target: BenchmarkTargetDefinition
  effective_constraints: RetrocastTaskConstraint[]
  candidates: RetrocastScoredCandidate[]
  wall_time: number | null
  cpu_time: number | null
}

export type RetrocastEvaluationFile = {
  task: BenchmarkDefinition
  tiers: RetrocastTier[]
  metric_label: string
  acceptable_match_level: "full" | "no_stereo" | "connectivity"
  acceptable_route_match: "prefix" | "exact"
  targets: Record<string, RetrocastTargetEvaluation>
  schema_version: "2"
}

export const RETROCAST_RELIABILITY_CODES = ["OK", "LOW_N", "EXTREME_P"] as const
export type RetrocastReliabilityCode =
  (typeof RETROCAST_RELIABILITY_CODES)[number]

export type MetricReliability = {
  code: RetrocastReliabilityCode
  message: string
}

export type MetricEstimate = {
  value: number
  count: number
  ci_low: number | null
  ci_high: number | null
  reliability: MetricReliability | null
}

export type RetrocastRuntimeSummary = {
  total_wall_time: number | null
  mean_wall_time: number | null
  total_cpu_time: number | null
  mean_cpu_time: number | null
  timed_target_count: number
}

export type RetrocastMetricStatistic = "rate" | "mrr"
export type TierValidityMetricKey =
  `tier_${RetrocastTier}_validity_${RetrocastMetricStatistic}`
export type SolvMetricKey =
  `solv_${RetrocastTier}[${string}]_${RetrocastMetricStatistic}`

export type RetrocastAnalysisFile = {
  schema_version: "2"
  metrics: Record<string, MetricEstimate>
  by_stratum: Record<string, Record<string, MetricEstimate>>
  bootstrap_resamples: number | null
  runtime: RetrocastRuntimeSummary
}

export type RetrocastManifestFileInfo = {
  label: string | null
  path: string
  sha256: string
  content_hash: string | null
}

export type RetrocastManifestFile = {
  schema_version: "2"
  retrocast_version: string
  created_at: string
  action: string
  parameters: JsonObject
  directives: JsonObject
  release_name: string | null
  source_files: RetrocastManifestFileInfo[]
  output_files:
    | RetrocastManifestFileInfo[]
    | Record<string, RetrocastManifestFileInfo>
  statistics: JsonObject
  summary: JsonObject
  [key: string]: unknown
}

export type RetrocastEvaluationRun = {
  engine: string
  workers: number
  targets: number
  candidates: number
  ingest_seconds: number
  score_seconds: number
  analyze_seconds: number
  total_seconds: number
  targets_per_second: number
  candidates_per_second: number
  [key: string]: unknown
}

export type EvaluationBundleFiles = {
  candidates: string
  evaluation: string
  analysis: string
  evaluationRun: string
  manifest: string
}

export type ArtifactVerificationPolicy = "outputs" | "outputs-and-sources"

export type LoadEvaluationBundleOptions = {
  verification?: ArtifactVerificationPolicy
}

export type EvaluationBundleVerification = {
  policy: ArtifactVerificationPolicy
  outputFiles: string[]
  sourceFiles: string[]
}

export type VerifiedEvaluationBundle = {
  rootDir: string
  manifestSha256: string
  verification: EvaluationBundleVerification
  files: EvaluationBundleFiles
  manifest: RetrocastManifestFile
  candidatesByTarget: RetrocastCandidatesByTarget
  evaluation: RetrocastEvaluationFile
  analysis: RetrocastAnalysisFile
  evaluationRun: RetrocastEvaluationRun
}

export type VerifiedEvaluationBundleForImport = Omit<
  VerifiedEvaluationBundle,
  "candidatesByTarget"
> & {
  candidateTargetCount: number
  candidateCount: number
}

export type ParsedTierValidityMetricKey = {
  family: "tier-validity"
  tier: RetrocastTier
  statistic: RetrocastMetricStatistic
}

export type ParsedSolvMetricKey = {
  family: "solv"
  tier: RetrocastTier
  label: string
  statistic: RetrocastMetricStatistic
}

export type ParsedCanonicalMetricKey =
  | ParsedTierValidityMetricKey
  | ParsedSolvMetricKey

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
