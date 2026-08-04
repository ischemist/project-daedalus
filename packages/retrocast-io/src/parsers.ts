import {
  assertRetrocastCandidate,
  assertRetrocastRoute,
  parseRetrocastCandidates,
} from "@ischemist/routes"
import type {
  JsonObject,
  RetrocastCandidate,
  RetrocastCandidatesByTarget,
} from "@ischemist/routes"
import { isDeepStrictEqual } from "node:util"

import { parseCanonicalMetricKey } from "./metrics.js"
import type {
  BenchmarkDefinition,
  BenchmarkTargetDefinition,
  MetricEstimate,
  MetricReliability,
  RetrocastAnalysisFile,
  RetrocastAssessmentRouteBinding,
  RetrocastCheckResult,
  RetrocastCheckStatus,
  RetrocastConstraintResult,
  RetrocastEvaluationFile,
  RetrocastEvaluationRun,
  RetrocastManifestFile,
  RetrocastManifestFileInfo,
  RetrocastObligationAssessment,
  RetrocastReactionAssessment,
  RetrocastReactionValidity,
  RetrocastReliabilityCode,
  RetrocastRouteValidity,
  RetrocastRuntimeSummary,
  RetrocastScoredCandidate,
  RetrocastTargetEvaluation,
  RetrocastTaskConstraint,
  RetrocastTier,
  RetrocastTierResult,
} from "./types.js"

function assertObject(
  value: unknown,
  label: string
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a json object`)
  }
}

function nullRecord<T>(): Record<string, T> {
  return Object.create(null) as Record<string, T>
}

function parseJsonObject(value: unknown, label: string): JsonObject {
  assertObject(value, label)
  return value
}

function parseOptionalJsonObject(value: unknown, label: string): JsonObject {
  return value === undefined ? {} : parseJsonObject(value, label)
}

function parseString(value: unknown, label: string): string {
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string`)
  }
  return value
}

function parseNonEmptyString(value: unknown, label: string): string {
  const parsed = parseString(value, label)
  if (parsed.length === 0) {
    throw new Error(`${label} must not be empty`)
  }
  return parsed
}

function parseNullableString(value: unknown, label: string): string | null {
  return value == null ? null : parseString(value, label)
}

function parseBoolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${label} must be a boolean`)
  }
  return value
}

function parseFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`)
  }
  return value
}

function parseNullableFiniteNumber(
  value: unknown,
  label: string
): number | null {
  return value == null ? null : parseFiniteNumber(value, label)
}

function parseNonNegativeInteger(value: unknown, label: string): number {
  const parsed = parseFiniteNumber(value, label)
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${label} must be a non-negative integer`)
  }
  return parsed
}

function parsePositiveInteger(value: unknown, label: string): number {
  const parsed = parseNonNegativeInteger(value, label)
  if (parsed === 0) {
    throw new Error(`${label} must be positive`)
  }
  return parsed
}

function parseNonNegativeNumber(value: unknown, label: string): number {
  const parsed = parseFiniteNumber(value, label)
  if (parsed < 0) {
    throw new Error(`${label} must be non-negative`)
  }
  return parsed
}

function parseEnum<const T extends readonly string[]>(
  value: unknown,
  values: T,
  label: string
): T[number] {
  if (typeof value !== "string" || !values.includes(value)) {
    throw new Error(`${label} must be one of ${values.join(", ")}`)
  }
  return value as T[number]
}

function parseTaskConstraint(
  value: unknown,
  label: string
): RetrocastTaskConstraint {
  const constraint = parseJsonObject(value, label)
  const kind = parseNonEmptyString(constraint.kind, `${label}.kind`)
  if (kind === "retrocast.stock_termination") {
    const stock = parseNonEmptyString(constraint.stock, `${label}.stock`)
    if (stock.trim() !== stock) {
      throw new Error(`${label}.stock cannot start or end with whitespace`)
    }
  } else if (kind === "retrocast.required_leaves") {
    if (!Array.isArray(constraint.smiles)) {
      throw new Error(`${label}.smiles must be an array`)
    }
    constraint.smiles.forEach((smiles, index) => {
      const parsed = parseNonEmptyString(smiles, `${label}.smiles[${index}]`)
      if (parsed.trim() !== parsed) {
        throw new Error(
          `${label}.smiles[${index}] cannot start or end with whitespace`
        )
      }
    })
  } else if (kind === "retrocast.route_depth") {
    const maximum = constraint.max_depth
    const valid =
      (typeof maximum === "number" &&
        Number.isInteger(maximum) &&
        maximum > 0) ||
      maximum === "short" ||
      maximum === "medium" ||
      maximum === "long"
    if (!valid) {
      throw new Error(
        `${label}.max_depth must be a positive integer or short, medium, or long`
      )
    }
  }
  return constraint as RetrocastTaskConstraint
}

function parseTaskConstraints(
  value: unknown,
  label: string
): RetrocastTaskConstraint[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`)
  }
  const constraints = value.map((item, index) =>
    parseTaskConstraint(item, `${label}[${index}]`)
  )
  const kinds = new Set(constraints.map((constraint) => constraint.kind))
  if (kinds.size !== constraints.length) {
    throw new Error(`${label} contains duplicate constraint kinds`)
  }
  return constraints
}

function parseBenchmarkTarget(
  value: unknown,
  label: string
): BenchmarkTargetDefinition {
  assertObject(value, label)
  const id = parseNonEmptyString(value.id, `${label}.id`)
  const smiles = parseNonEmptyString(value.smiles, `${label}.smiles`)
  const inchikey = parseNonEmptyString(value.inchikey, `${label}.inchikey`)
  if (!Array.isArray(value.acceptable_routes)) {
    throw new Error(`${label}.acceptable_routes must be an array`)
  }
  const acceptableRoutes = value.acceptable_routes.map((route, index) => {
    assertRetrocastRoute(route, `${label}.acceptable_routes[${index}]`)
    return route
  })

  return {
    id,
    smiles,
    inchikey,
    annotations: parseOptionalJsonObject(
      value.annotations,
      `${label}.annotations`
    ),
    acceptable_routes: acceptableRoutes,
  }
}

export function parseBenchmarkDefinition(value: unknown): BenchmarkDefinition {
  assertObject(value, "benchmark definition")
  if (value.schema_version !== "2") {
    throw new Error('benchmark definition schema_version must be "2"')
  }
  assertObject(value.targets, "benchmark definition targets")
  const targets = nullRecord<BenchmarkTargetDefinition>()
  for (const [targetId, target] of Object.entries(value.targets)) {
    const parsedTarget = parseBenchmarkTarget(
      target,
      `benchmark target ${targetId}`
    )
    if (parsedTarget.id !== targetId) {
      throw new Error(
        `benchmark target ${targetId}.id must match its target key`
      )
    }
    targets[targetId] = parsedTarget
  }

  const constraints = nullRecord<RetrocastTaskConstraint[]>()
  if (value.constraints != null) {
    assertObject(value.constraints, "benchmark definition constraints")
    for (const [targetId, targetConstraints] of Object.entries(
      value.constraints
    )) {
      if (!(targetId in targets)) {
        throw new Error(
          `benchmark definition constraints references unknown target ${targetId}`
        )
      }
      constraints[targetId] = parseTaskConstraints(
        targetConstraints,
        `benchmark definition constraints.${targetId}`
      )
    }
  }

  return {
    name: parseNonEmptyString(value.name, "benchmark definition name"),
    ...(value.description === undefined
      ? {}
      : {
          description: parseString(
            value.description,
            "benchmark definition description"
          ),
        }),
    targets,
    default_constraints:
      value.default_constraints == null
        ? []
        : parseTaskConstraints(
            value.default_constraints,
            "benchmark definition default_constraints"
          ),
    constraints,
    metric_label: parseNullableString(
      value.metric_label,
      "benchmark definition metric_label"
    ),
    annotations: parseOptionalJsonObject(
      value.annotations,
      "benchmark definition annotations"
    ),
    schema_version: "2",
  }
}

export function effectiveConstraints(
  task: BenchmarkDefinition,
  targetId: string
): RetrocastTaskConstraint[] {
  const byKind = new Map(
    task.default_constraints.map((constraint) => [constraint.kind, constraint])
  )
  for (const constraint of task.constraints[targetId] ?? []) {
    byKind.set(constraint.kind, constraint)
  }
  return [...byKind.values()].sort((left, right) =>
    left.kind < right.kind ? -1 : left.kind > right.kind ? 1 : 0
  )
}

export function derivedMetricLabel(task: BenchmarkDefinition): string {
  if (task.metric_label !== null) {
    return task.metric_label
  }
  const stocks = new Set(
    task.default_constraints
      .filter(
        (constraint) =>
          constraint.kind === "retrocast.stock_termination" &&
          typeof constraint.stock === "string"
      )
      .map((constraint) => constraint.stock as string)
  )
  const parts: string[] = []
  if (stocks.size === 1) {
    parts.push([...stocks][0] as string)
  } else if (stocks.size > 1) {
    parts.push("stocks")
  }
  const kinds = new Set([
    ...task.default_constraints.map((constraint) => constraint.kind),
    ...Object.values(task.constraints)
      .flat()
      .map((constraint) => constraint.kind),
  ])
  if (kinds.has("retrocast.required_leaves")) {
    parts.push("leaf")
  }
  if (kinds.has("retrocast.route_depth")) {
    parts.push("depth")
  }
  return parts.length === 0 ? "task" : parts.join("+")
}

function parseCheckStatus(value: unknown, label: string): RetrocastCheckStatus {
  return parseEnum(value, ["pass", "fail", "not_evaluated"] as const, label)
}

function parseCheckResult(value: unknown, label: string): RetrocastCheckResult {
  assertObject(value, label)
  return {
    code: parseNonEmptyString(value.code, `${label}.code`),
    status: parseCheckStatus(value.status, `${label}.status`),
    message: parseNullableString(value.message, `${label}.message`),
    details: parseOptionalJsonObject(value.details, `${label}.details`),
  }
}

function parseTierResult(value: unknown, label: string): RetrocastTierResult {
  assertObject(value, label)
  if (value.checks !== undefined && !Array.isArray(value.checks)) {
    throw new Error(`${label}.checks must be an array`)
  }
  const status = parseCheckStatus(value.status, `${label}.status`)
  const checks = (value.checks ?? []).map((check, index) =>
    parseCheckResult(check, `${label}.checks[${index}]`)
  )
  assertAggregateStatus(status, checks, label)
  return { status, checks }
}

function assertAggregateStatus(
  status: RetrocastCheckStatus,
  checks: RetrocastCheckResult[],
  label: string
): void {
  if (checks.some((check) => check.status === "not_evaluated")) {
    throw new Error(`${label}.checks cannot contain not_evaluated statuses`)
  }
  const consistent =
    (status === "pass" && checks.every((check) => check.status === "pass")) ||
    (status === "fail" && checks.some((check) => check.status === "fail")) ||
    (status === "not_evaluated" && checks.length === 0)
  if (!consistent) {
    throw new Error(`${label}.status does not agree with its checks`)
  }
}

function parseTierKey(value: string, label: string): `${RetrocastTier}` {
  if (!/^[0-3]$/.test(value)) {
    throw new Error(`${label} must be a tier from 0 through 3`)
  }
  return value as `${RetrocastTier}`
}

function parseTierResults(
  value: unknown,
  label: string
): Partial<Record<`${RetrocastTier}`, RetrocastTierResult>> {
  assertObject(value, label)
  const tiers: Partial<Record<`${RetrocastTier}`, RetrocastTierResult>> = {}
  for (const [tier, result] of Object.entries(value)) {
    const parsedTier = parseTierKey(tier, `${label} key`)
    tiers[parsedTier] = parseTierResult(result, `${label}.${tier}`)
  }
  return tiers
}

function parseRouteValidity(
  value: unknown,
  label: string
): RetrocastRouteValidity {
  assertObject(value, label)
  if (!Array.isArray(value.reactions)) {
    throw new Error(`${label}.reactions must be an array`)
  }
  const reactions: RetrocastReactionValidity[] = value.reactions.map(
    (reaction, index) => {
      const reactionLabel = `${label}.reactions[${index}]`
      assertObject(reaction, reactionLabel)
      const reactionId = parseNonEmptyString(
        reaction.reaction_id,
        `${reactionLabel}.reaction_id`
      )
      if (!/^rc:r:\/(?:0|[1-9]\d*)?(?:\/(?:0|[1-9]\d*))*$/.test(reactionId)) {
        throw new Error(
          `${reactionLabel}.reaction_id must be a canonical RetroCast reaction path`
        )
      }
      return {
        reaction_id: reactionId,
        tiers: parseTierResults(reaction.tiers, `${reactionLabel}.tiers`),
      }
    }
  )
  if (
    new Set(reactions.map((reaction) => reaction.reaction_id)).size !==
    reactions.length
  ) {
    throw new Error(`${label}.reactions contains duplicate reaction ids`)
  }

  const result: RetrocastRouteValidity = {
    ...value,
    tiers: parseTierResults(value.tiers, `${label}.tiers`),
    reactions,
  }
  if (value.reaction_assessments !== undefined) {
    result.reaction_assessments = parseReactionAssessments(
      value.reaction_assessments,
      `${label}.reaction_assessments`
    )
  }
  if (value.molecule_assessments !== undefined) {
    result.molecule_assessments = parseObligationAssessments(
      value.molecule_assessments,
      `${label}.molecule_assessments`
    )
  }
  if (value.route_assessments !== undefined) {
    result.route_assessments = parseObligationAssessments(
      value.route_assessments,
      `${label}.route_assessments`
    )
  }
  if (value.assessment_route_binding !== undefined) {
    result.assessment_route_binding =
      value.assessment_route_binding == null
        ? null
        : parseAssessmentRouteBinding(
            value.assessment_route_binding,
            `${label}.assessment_route_binding`
          )
  }
  return result
}

function parseJsonObjectArray(value: unknown, label: string): JsonObject[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`)
  }
  return value.map((item, index) => parseJsonObject(item, `${label}[${index}]`))
}

function parseObligationAssessment(
  value: unknown,
  label: string
): RetrocastObligationAssessment {
  const assessment = parseJsonObject(value, label)
  return {
    ...assessment,
    claim: parseJsonObject(assessment.claim, `${label}.claim`),
    evaluation: parseJsonObject(assessment.evaluation, `${label}.evaluation`),
    receipts: parseJsonObjectArray(assessment.receipts, `${label}.receipts`),
  }
}

function parseObligationAssessments(
  value: unknown,
  label: string
): RetrocastObligationAssessment[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`)
  }
  return value.map((assessment, index) =>
    parseObligationAssessment(assessment, `${label}[${index}]`)
  )
}

function parseReactionAssessments(
  value: unknown,
  label: string
): RetrocastReactionAssessment[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`)
  }
  return value.map((assessmentValue, index) => {
    const assessmentLabel = `${label}[${index}]`
    const assessment = parseJsonObject(assessmentValue, assessmentLabel)
    const closestReference =
      assessment.closest_reference == null
        ? null
        : parseJsonObject(
            assessment.closest_reference,
            `${assessmentLabel}.closest_reference`
          )
    return {
      ...assessment,
      reaction_id: parseNonEmptyString(
        assessment.reaction_id,
        `${assessmentLabel}.reaction_id`
      ),
      semantics_id: parseNonEmptyString(
        assessment.semantics_id,
        `${assessmentLabel}.semantics_id`
      ),
      identities: parseJsonObject(
        assessment.identities,
        `${assessmentLabel}.identities`
      ),
      coverage: parseJsonObject(
        assessment.coverage,
        `${assessmentLabel}.coverage`
      ),
      obligations: parseObligationAssessments(
        assessment.obligations,
        `${assessmentLabel}.obligations`
      ),
      closest_reference: closestReference,
    }
  })
}

function parseAssessmentRouteBinding(
  value: unknown,
  label: string
): RetrocastAssessmentRouteBinding {
  const binding = parseJsonObject(value, label)
  const sha256 = parseNonEmptyString(binding.sha256, `${label}.sha256`)
  if (!/^[a-f\d]{64}$/i.test(sha256)) {
    throw new Error(`${label}.sha256 must be a SHA256 digest`)
  }
  return {
    ...binding,
    profile_id: parseNonEmptyString(binding.profile_id, `${label}.profile_id`),
    sha256: sha256.toLowerCase(),
  }
}

function parseConstraintResult(
  value: unknown,
  label: string
): RetrocastConstraintResult {
  assertObject(value, label)
  if (value.checks !== undefined && !Array.isArray(value.checks)) {
    throw new Error(`${label}.checks must be an array`)
  }
  const status = parseCheckStatus(value.status, `${label}.status`)
  const checks = (value.checks ?? []).map((check, index) =>
    parseCheckResult(check, `${label}.checks[${index}]`)
  )
  assertAggregateStatus(status, checks, label)
  return { status, checks }
}

function parseScoredCandidate(
  value: unknown,
  label: string
): RetrocastScoredCandidate {
  assertObject(value, label)
  const candidatePayload: unknown = value
  assertRetrocastCandidate(candidatePayload, label)

  const validity = parseRouteValidity(value.validity, `${label}.validity`)
  const constraints = parseConstraintResult(
    value.constraints,
    `${label}.constraints`
  )
  const matchesAcceptable =
    value.matches_acceptable === undefined
      ? false
      : parseBoolean(value.matches_acceptable, `${label}.matches_acceptable`)
  const matchedAcceptableIndex =
    value.matched_acceptable_index == null
      ? null
      : parseNonNegativeInteger(
          value.matched_acceptable_index,
          `${label}.matched_acceptable_index`
        )

  if (matchesAcceptable !== (matchedAcceptableIndex !== null)) {
    throw new Error(
      `${label}.matches_acceptable must agree with matched_acceptable_index`
    )
  }

  const tierZero = validity.tiers["0"]
  if (!tierZero) {
    throw new Error(`${label}.validity.tiers.0 is required`)
  }
  if (value.route != null && tierZero.status !== "pass") {
    throw new Error(`${label} route candidate must pass Tier-0 validity`)
  }
  if (value.failure != null && tierZero.status !== "fail") {
    throw new Error(`${label} failure candidate must fail Tier-0 validity`)
  }
  if (value.failure != null && constraints.status !== "not_evaluated") {
    throw new Error(
      `${label} failure candidate constraints must be not_evaluated`
    )
  }
  if (value.route != null && constraints.status === "not_evaluated") {
    throw new Error(`${label} route candidate constraints must be evaluated`)
  }
  if (value.failure != null && matchesAcceptable) {
    throw new Error(
      `${label} failure candidate cannot match an acceptable route`
    )
  }

  const shared = {
    rank: candidatePayload.rank,
    validity,
    constraints,
    matches_acceptable: matchesAcceptable,
    matched_acceptable_index: matchedAcceptableIndex,
  }
  return candidatePayload.route != null
    ? { ...shared, route: candidatePayload.route, failure: null }
    : { ...shared, route: null, failure: candidatePayload.failure }
}

function parseTargetEvaluation(
  value: unknown,
  label: string,
  evaluatedTiers: RetrocastTier[]
): RetrocastTargetEvaluation {
  assertObject(value, label)
  if (!Array.isArray(value.candidates)) {
    throw new Error(`${label}.candidates must be an array`)
  }
  const candidates = value.candidates.map((candidate, index) =>
    parseScoredCandidate(candidate, `${label}.candidates[${index}]`)
  )
  const ranks = new Set(candidates.map((candidate) => candidate.rank))
  if (ranks.size !== candidates.length) {
    throw new Error(`${label}.candidates contains duplicate ranks`)
  }

  for (const candidate of candidates) {
    const reportedTiers = Object.keys(candidate.validity.tiers).map(Number)
    const unrequestedTier = reportedTiers.find(
      (tier) => !evaluatedTiers.includes(tier as RetrocastTier)
    )
    if (unrequestedTier !== undefined) {
      throw new Error(
        `${label}.candidates rank ${candidate.rank} reports unevaluated Tier ${unrequestedTier}`
      )
    }
    if (candidate.route != null) {
      const missingTier = evaluatedTiers.find(
        (tier) => candidate.validity.tiers[`${tier}`] === undefined
      )
      if (missingTier !== undefined) {
        throw new Error(
          `${label}.candidates rank ${candidate.rank} is missing evaluated Tier ${missingTier}`
        )
      }
    }
    for (const reaction of candidate.validity.reactions) {
      const unrequestedReactionTier = Object.keys(reaction.tiers)
        .map(Number)
        .find((tier) => !evaluatedTiers.includes(tier as RetrocastTier))
      if (unrequestedReactionTier !== undefined) {
        throw new Error(
          `${label}.candidates rank ${candidate.rank} reaction ${reaction.reaction_id} reports unevaluated Tier ${unrequestedReactionTier}`
        )
      }
    }
  }

  const target = parseBenchmarkTarget(value.target, `${label}.target`)
  for (const candidate of candidates) {
    if (
      candidate.matched_acceptable_index !== null &&
      candidate.matched_acceptable_index >= target.acceptable_routes.length
    ) {
      throw new Error(
        `${label}.candidates rank ${candidate.rank} matched_acceptable_index is out of bounds`
      )
    }
    if (
      candidate.route != null &&
      (candidate.route.target.smiles !== target.smiles ||
        candidate.route.target.inchikey !== target.inchikey)
    ) {
      throw new Error(
        `${label}.candidates rank ${candidate.rank} route target does not match the enclosing target`
      )
    }
    if (candidate.failure != null) {
      for (const [field, actual, expected] of [
        ["target_id", candidate.failure.target_id, target.id],
        ["target_smiles", candidate.failure.target_smiles, target.smiles],
        ["target_inchikey", candidate.failure.target_inchikey, target.inchikey],
      ] as const) {
        if (actual != null && actual !== expected) {
          throw new Error(
            `${label}.candidates rank ${candidate.rank} failure ${field} does not match the enclosing target`
          )
        }
      }
    }
  }

  return {
    target,
    effective_constraints: parseTaskConstraints(
      value.effective_constraints,
      `${label}.effective_constraints`
    ),
    candidates,
    wall_time: parseNullableFiniteNumber(value.wall_time, `${label}.wall_time`),
    cpu_time: parseNullableFiniteNumber(value.cpu_time, `${label}.cpu_time`),
  }
}

export function parseEvaluationFile(value: unknown): RetrocastEvaluationFile {
  assertObject(value, "evaluation file")
  if (value.schema_version !== "2") {
    throw new Error('evaluation file schema_version must be "2"')
  }
  if (!Array.isArray(value.tiers)) {
    throw new Error("evaluation file tiers must be an array")
  }
  const tiers = value.tiers.map((tier, index) => {
    const parsed = parseNonNegativeInteger(
      tier,
      `evaluation file tiers[${index}]`
    )
    if (parsed > 3) {
      throw new Error(`evaluation file tiers[${index}] must not exceed 3`)
    }
    return parsed as RetrocastTier
  })
  if (new Set(tiers).size !== tiers.length) {
    throw new Error("evaluation file tiers contains duplicates")
  }
  if (!tiers.includes(0)) {
    throw new Error("evaluation file tiers must include Tier 0")
  }

  const task = parseBenchmarkDefinition(value.task)
  assertObject(value.targets, "evaluation file targets")
  const targets = nullRecord<RetrocastTargetEvaluation>()
  for (const [targetId, targetResult] of Object.entries(value.targets)) {
    if (!(targetId in task.targets)) {
      throw new Error(`evaluation target ${targetId} is not in the task`)
    }
    const parsedTarget = parseTargetEvaluation(
      targetResult,
      `evaluation target ${targetId}`,
      tiers
    )
    if (parsedTarget.target.id !== targetId) {
      throw new Error(
        `evaluation target ${targetId}.target.id must match its key`
      )
    }
    if (!isDeepStrictEqual(task.targets[targetId], parsedTarget.target)) {
      throw new Error(
        `evaluation target ${targetId} does not match its task definition`
      )
    }
    const expectedConstraints = effectiveConstraints(task, targetId)
    if (
      !isDeepStrictEqual(
        parsedTarget.effective_constraints,
        expectedConstraints
      )
    ) {
      throw new Error(
        `evaluation target ${targetId}.effective_constraints does not match task overrides`
      )
    }
    targets[targetId] = parsedTarget
  }
  const taskIds = Object.keys(task.targets)
  if (taskIds.some((targetId) => !(targetId in targets))) {
    throw new Error("evaluation file must contain every task target")
  }

  const metricLabel = parseNonEmptyString(
    value.metric_label,
    "evaluation file metric_label"
  )
  const expectedMetricLabel = derivedMetricLabel(task)
  if (metricLabel !== expectedMetricLabel) {
    throw new Error(
      `evaluation file metric_label ${metricLabel} does not match derived task label ${expectedMetricLabel}`
    )
  }

  return {
    task,
    tiers,
    metric_label: metricLabel,
    acceptable_match_level: parseEnum(
      value.acceptable_match_level,
      ["full", "no_stereo", "connectivity"] as const,
      "evaluation file acceptable_match_level"
    ),
    acceptable_route_match: parseEnum(
      value.acceptable_route_match,
      ["prefix", "exact"] as const,
      "evaluation file acceptable_route_match"
    ),
    targets,
    schema_version: "2",
  }
}

function parseMetricEstimate(value: unknown, label: string): MetricEstimate {
  assertObject(value, label)
  let reliability: MetricReliability | null = null
  if (value.reliability != null) {
    assertObject(value.reliability, `${label}.reliability`)
    reliability = {
      code: parseEnum(
        value.reliability.code,
        ["OK", "LOW_N", "EXTREME_P"] as const,
        `${label}.reliability.code`
      ) as RetrocastReliabilityCode,
      message: parseString(
        value.reliability.message,
        `${label}.reliability.message`
      ),
    }
  }
  return {
    value: parseFiniteNumber(value.value, `${label}.value`),
    count: parseNonNegativeInteger(value.count, `${label}.count`),
    ci_low: parseNullableFiniteNumber(value.ci_low, `${label}.ci_low`),
    ci_high: parseNullableFiniteNumber(value.ci_high, `${label}.ci_high`),
    reliability,
  }
}

function parseMetricMap(
  value: unknown,
  label: string
): Record<string, MetricEstimate> {
  assertObject(value, label)
  return Object.fromEntries(
    Object.entries(value).map(([metricKey, value]) => {
      const estimate = parseMetricEstimate(value, `${label}.${metricKey}`)
      if (
        estimate.ci_low !== null &&
        estimate.ci_high !== null &&
        estimate.ci_low > estimate.ci_high
      ) {
        throw new Error(`${label}.${metricKey} confidence interval is inverted`)
      }
      if (parseCanonicalMetricKey(metricKey)) {
        for (const [field, metricValue] of [
          ["value", estimate.value],
          ["ci_low", estimate.ci_low],
          ["ci_high", estimate.ci_high],
        ] as const) {
          if (metricValue !== null && (metricValue < 0 || metricValue > 1)) {
            throw new Error(
              `${label}.${metricKey}.${field} must be between 0 and 1`
            )
          }
        }
      }
      return [metricKey, estimate]
    })
  )
}

function parseRuntimeSummary(
  value: unknown,
  label: string
): RetrocastRuntimeSummary {
  if (value === undefined) {
    return {
      total_wall_time: null,
      mean_wall_time: null,
      total_cpu_time: null,
      mean_cpu_time: null,
      timed_target_count: 0,
    }
  }
  assertObject(value, label)
  return {
    total_wall_time: parseNullableFiniteNumber(
      value.total_wall_time,
      `${label}.total_wall_time`
    ),
    mean_wall_time: parseNullableFiniteNumber(
      value.mean_wall_time,
      `${label}.mean_wall_time`
    ),
    total_cpu_time: parseNullableFiniteNumber(
      value.total_cpu_time,
      `${label}.total_cpu_time`
    ),
    mean_cpu_time: parseNullableFiniteNumber(
      value.mean_cpu_time,
      `${label}.mean_cpu_time`
    ),
    timed_target_count:
      value.timed_target_count == null
        ? 0
        : parseNonNegativeInteger(
            value.timed_target_count,
            `${label}.timed_target_count`
          ),
  }
}

export function parseAnalysisFile(value: unknown): RetrocastAnalysisFile {
  assertObject(value, "analysis file")
  if (value.schema_version !== "2") {
    throw new Error('analysis file schema_version must be "2"')
  }
  const byStratum = nullRecord<Record<string, MetricEstimate>>()
  if (value.by_stratum !== undefined) {
    assertObject(value.by_stratum, "analysis file by_stratum")
    for (const [stratum, metrics] of Object.entries(value.by_stratum)) {
      byStratum[stratum] = parseMetricMap(
        metrics,
        `analysis file by_stratum.${stratum}`
      )
    }
  }

  return {
    schema_version: "2",
    metrics: parseMetricMap(value.metrics, "analysis file metrics"),
    by_stratum: byStratum,
    bootstrap_resamples:
      value.bootstrap_resamples == null
        ? null
        : parseNonNegativeInteger(
            value.bootstrap_resamples,
            "analysis file bootstrap_resamples"
          ),
    runtime: parseRuntimeSummary(value.runtime, "analysis file runtime"),
  }
}

export function parseEvaluationRun(value: unknown): RetrocastEvaluationRun {
  assertObject(value, "evaluation-run file")
  return {
    ...value,
    engine: parseNonEmptyString(value.engine, "evaluation-run file engine"),
    workers: parsePositiveInteger(value.workers, "evaluation-run file workers"),
    targets: parseNonNegativeInteger(
      value.targets,
      "evaluation-run file targets"
    ),
    candidates: parseNonNegativeInteger(
      value.candidates,
      "evaluation-run file candidates"
    ),
    ingest_seconds: parseNonNegativeNumber(
      value.ingest_seconds,
      "evaluation-run file ingest_seconds"
    ),
    score_seconds: parseNonNegativeNumber(
      value.score_seconds,
      "evaluation-run file score_seconds"
    ),
    analyze_seconds: parseNonNegativeNumber(
      value.analyze_seconds,
      "evaluation-run file analyze_seconds"
    ),
    total_seconds: parseNonNegativeNumber(
      value.total_seconds,
      "evaluation-run file total_seconds"
    ),
    targets_per_second: parseNonNegativeNumber(
      value.targets_per_second,
      "evaluation-run file targets_per_second"
    ),
    candidates_per_second: parseNonNegativeNumber(
      value.candidates_per_second,
      "evaluation-run file candidates_per_second"
    ),
  }
}

function parseManifestFileInfo(
  value: unknown,
  label: string
): RetrocastManifestFileInfo {
  assertObject(value, label)
  const sha256 = parseNonEmptyString(
    value.sha256 ?? value.file_hash,
    `${label}.sha256`
  )
  if (!/^[a-f\d]{64}$/i.test(sha256)) {
    throw new Error(`${label}.sha256 must be a SHA256 digest`)
  }
  return {
    label: parseNullableString(value.label, `${label}.label`),
    path: parseNonEmptyString(value.path, `${label}.path`),
    sha256: sha256.toLowerCase(),
    content_hash: parseNullableString(
      value.content_hash,
      `${label}.content_hash`
    ),
  }
}

export function manifestOutputFiles(
  manifest: RetrocastManifestFile
): RetrocastManifestFileInfo[] {
  return Array.isArray(manifest.output_files)
    ? manifest.output_files
    : Object.values(manifest.output_files)
}

export function parseManifestFile(value: unknown): RetrocastManifestFile {
  assertObject(value, "manifest file")
  if (value.schema_version !== "2") {
    throw new Error('manifest file schema_version must be "2"')
  }
  if (!Array.isArray(value.source_files)) {
    throw new Error("manifest file source_files must be an array")
  }
  const sourceFiles = value.source_files.map((file, index) =>
    parseManifestFileInfo(file, `manifest file source_files[${index}]`)
  )

  let outputFiles:
    | RetrocastManifestFileInfo[]
    | Record<string, RetrocastManifestFileInfo>
  if (Array.isArray(value.output_files)) {
    outputFiles = value.output_files.map((file, index) =>
      parseManifestFileInfo(file, `manifest file output_files[${index}]`)
    )
  } else {
    assertObject(value.output_files, "manifest file output_files")
    outputFiles = Object.fromEntries(
      Object.entries(value.output_files).map(([key, file]) => [
        key,
        parseManifestFileInfo(file, `manifest file output_files.${key}`),
      ])
    )
  }

  const createdAt = parseNonEmptyString(
    value.created_at,
    "manifest file created_at"
  )
  if (Number.isNaN(Date.parse(createdAt))) {
    throw new Error("manifest file created_at must be an ISO timestamp")
  }

  return {
    ...value,
    schema_version: "2",
    retrocast_version: parseNonEmptyString(
      value.retrocast_version,
      "manifest file retrocast_version"
    ),
    created_at: createdAt,
    action: parseNonEmptyString(value.action, "manifest file action"),
    parameters: parseOptionalJsonObject(
      value.parameters,
      "manifest file parameters"
    ),
    directives: parseOptionalJsonObject(
      value.directives,
      "manifest file directives"
    ),
    release_name: parseNullableString(
      value.release_name,
      "manifest file release_name"
    ),
    source_files: sourceFiles,
    output_files: outputFiles,
    statistics: parseOptionalJsonObject(
      value.statistics,
      "manifest file statistics"
    ),
    summary: parseOptionalJsonObject(value.summary, "manifest file summary"),
  }
}

export function parseCandidatesFile(
  value: unknown
): RetrocastCandidatesByTarget {
  return parseRetrocastCandidates(value)
}

export function assertCandidateAlignment(
  candidatesByTarget: RetrocastCandidatesByTarget,
  evaluation: RetrocastEvaluationFile
): void {
  const candidateTargetIds = Object.keys(candidatesByTarget).sort()
  const evaluationTargetIds = Object.keys(evaluation.targets).sort()
  if (
    candidateTargetIds.length !== evaluationTargetIds.length ||
    candidateTargetIds.some(
      (targetId, index) => targetId !== evaluationTargetIds[index]
    )
  ) {
    throw new Error(
      "candidate and evaluation files must contain the same target ids"
    )
  }

  for (const targetId of candidateTargetIds) {
    const candidates = candidatesByTarget[targetId] ?? []
    const scoredCandidates = evaluation.targets[targetId]?.candidates ?? []
    if (
      !isDeepStrictEqual(
        evaluation.task.targets[targetId],
        evaluation.targets[targetId]?.target
      )
    ) {
      throw new Error(
        `evaluation target ${targetId} does not match its task definition`
      )
    }
    if (candidates.length !== scoredCandidates.length) {
      throw new Error(
        `candidate and evaluation counts differ for target ${targetId}`
      )
    }
    candidates.forEach((candidate: RetrocastCandidate, index) => {
      const scoredCandidate = scoredCandidates[index]
      const sameKind =
        (candidate.route != null && scoredCandidate?.route != null) ||
        (candidate.failure != null && scoredCandidate?.failure != null)
      if (candidate.rank !== scoredCandidate?.rank || !sameKind) {
        throw new Error(
          `candidate and evaluation slots differ for target ${targetId} at index ${index}`
        )
      }
      const payloadMatches =
        candidate.route != null
          ? isDeepStrictEqual(candidate.route, scoredCandidate?.route)
          : isDeepStrictEqual(candidate.failure, scoredCandidate?.failure)
      if (!payloadMatches) {
        throw new Error(
          `candidate and evaluation payloads differ for target ${targetId} at rank ${candidate.rank}`
        )
      }
    })
  }
}
