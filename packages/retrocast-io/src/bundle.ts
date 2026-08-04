import { createHash } from "node:crypto"
import { createReadStream } from "node:fs"
import { realpath, stat } from "node:fs/promises"
import path from "node:path"

import type {
  JsonObject,
  RetrocastCandidate,
  RetrocastMolecule,
} from "@ischemist/routes"

import {
  parseJsonArtifactBytes,
  readArtifactWithSha256,
  readJsonArtifactWithSha256,
} from "./files.js"
import { getSolvMetric, getTierValidityMetric } from "./metrics.js"
import {
  assertCandidateAlignment,
  manifestOutputFiles,
  parseAnalysisFile,
  parseCandidatesFile,
  parseEvaluationFile,
  parseEvaluationRun,
  parseManifestFile,
} from "./parsers.js"
import { streamJsonObjectEntries } from "./streaming.js"
import type {
  ArtifactVerificationPolicy,
  EvaluationBundleFiles,
  LoadEvaluationBundleOptions,
  MetricEstimate,
  RetrocastAnalysisFile,
  RetrocastEvaluationFile,
  RetrocastEvaluationRun,
  RetrocastManifestFile,
  RetrocastManifestFileInfo,
  RetrocastScoredCandidate,
  RetrocastTargetEvaluation,
  RetrocastTier,
  VerifiedEvaluationBundle,
  VerifiedEvaluationBundleForImport,
} from "./types.js"

const REQUIRED_OUTPUTS = {
  candidates: "candidates.json.gz",
  evaluation: "evaluation.json.gz",
  analysis: "analysis.json.gz",
  evaluationRun: "evaluation-run.json",
} as const

type PreparedEvaluationBundle = {
  rootDir: string
  manifestPath: string
  manifestSha256: string
  manifest: RetrocastManifestFile
  outputFiles: Omit<EvaluationBundleFiles, "manifest">
  trackedOutputs: TrackedFile[]
  verificationPolicy: ArtifactVerificationPolicy
  verifiedSourceFiles: string[]
}

type TrackedFile = {
  info: RetrocastManifestFileInfo
  filePath: string
}

type CandidateDigest = {
  count: number
  sha256: string
}

const FILE_HASH_CONCURRENCY = 8

export async function computeFileSha256(filePath: string): Promise<string> {
  const hash = createHash("sha256")
  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk)
  }
  return hash.digest("hex")
}

function isConfined(rootDir: string, filePath: string): boolean {
  const relative = path.relative(rootDir, filePath)
  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  )
}

async function resolveRegularFile(
  filePath: string,
  label: string
): Promise<string> {
  const resolved = await realpath(filePath)
  if (!(await stat(resolved)).isFile()) {
    throw new Error(`evaluation bundle ${label} must be a regular file`)
  }
  return resolved
}

async function resolveBundleOutput(
  rootDir: string,
  file: RetrocastManifestFileInfo
): Promise<string> {
  if (path.isAbsolute(file.path)) {
    throw new Error(
      `evaluation bundle output path must be relative: ${file.path}`
    )
  }
  const lexicalPath = path.resolve(rootDir, file.path)
  if (!isConfined(rootDir, lexicalPath)) {
    throw new Error(`evaluation bundle output escapes its root: ${file.path}`)
  }
  const resolved = await resolveRegularFile(
    lexicalPath,
    `output ${JSON.stringify(file.path)}`
  )
  if (!isConfined(rootDir, resolved)) {
    throw new Error(
      `evaluation bundle output resolves outside its root: ${file.path}`
    )
  }
  return resolved
}

function resolveRequiredOutputFiles(
  outputs: RetrocastManifestFileInfo[],
  resolvedOutputs: string[]
): Omit<EvaluationBundleFiles, "manifest"> {
  const resolved = {} as Omit<EvaluationBundleFiles, "manifest">
  for (const [key, fileName] of Object.entries(REQUIRED_OUTPUTS) as [
    keyof typeof REQUIRED_OUTPUTS,
    string,
  ][]) {
    const matches = outputs
      .map((file, index) => ({
        file,
        filePath: resolvedOutputs[index] as string,
      }))
      .filter(({ file }) => path.basename(file.path) === fileName)
    if (matches.length !== 1) {
      throw new Error(
        `evaluation bundle manifest must track exactly one ${fileName} output`
      )
    }
    resolved[key] = matches[0]?.filePath as string
  }
  return resolved
}

async function verifyTrackedFiles(
  files: TrackedFile[],
  label: string
): Promise<string[]> {
  const hashes: {
    info: RetrocastManifestFileInfo
    filePath: string
    actual: string
  }[] = []
  for (let index = 0; index < files.length; index += FILE_HASH_CONCURRENCY) {
    const batch = files.slice(index, index + FILE_HASH_CONCURRENCY)
    hashes.push(
      ...(await Promise.all(
        batch.map(async ({ info, filePath }) => ({
          info,
          filePath,
          actual: await computeFileSha256(filePath),
        }))
      ))
    )
  }
  for (const { info, actual } of hashes) {
    const expected = info.sha256.toLowerCase()
    if (actual !== expected) {
      throw new Error(
        `evaluation bundle ${label} hash mismatch for ${info.path}: expected ${info.sha256}, got ${actual}`
      )
    }
  }
  return hashes.map(({ filePath }) => filePath)
}

function assertTrackedFileSha256(
  file: TrackedFile,
  actual: string,
  label: string
): void {
  if (actual !== file.info.sha256) {
    throw new Error(
      `evaluation bundle ${label} hash mismatch for ${file.info.path}: expected ${file.info.sha256}, got ${actual}`
    )
  }
}

async function readVerifiedJsonArtifact(
  file: TrackedFile,
  label: string
): Promise<unknown> {
  const artifact = await readArtifactWithSha256(file.filePath)
  assertTrackedFileSha256(file, artifact.sha256, label)
  return parseJsonArtifactBytes(artifact.content, file.filePath.endsWith(".gz"))
}

function requiredTrackedOutput(
  prepared: PreparedEvaluationBundle,
  key: keyof typeof REQUIRED_OUTPUTS
): TrackedFile {
  const filePath = prepared.outputFiles[key]
  const tracked = prepared.trackedOutputs.find(
    (candidate) => candidate.filePath === filePath
  )
  if (!tracked) {
    throw new Error(
      `evaluation bundle lost tracked output ${REQUIRED_OUTPUTS[key]}`
    )
  }
  return tracked
}

async function verifyExtraOutputs(
  prepared: PreparedEvaluationBundle
): Promise<void> {
  const requiredPaths = new Set(Object.values(prepared.outputFiles))
  await verifyTrackedFiles(
    prepared.trackedOutputs.filter(
      (output) => !requiredPaths.has(output.filePath)
    ),
    "output"
  )
}

async function resolveSourceFile(
  rootDir: string,
  file: RetrocastManifestFileInfo
): Promise<string> {
  const lexicalPath = path.isAbsolute(file.path)
    ? path.normalize(file.path)
    : path.resolve(rootDir, file.path)
  return resolveRegularFile(lexicalPath, `source ${JSON.stringify(file.path)}`)
}

function assertSupportedRetrocastVersion(version: string): void {
  const match =
    /^(\d+)\.(\d+)\.(\d+)(-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.exec(version)
  if (!match) {
    throw new Error(
      `manifest retrocast_version is not valid semver: ${version}`
    )
  }
  const major = Number(match[1])
  const minor = Number(match[2])
  const patchVersion = Number(match[3])
  const prerelease = match[4]
  if (
    major !== 0 ||
    minor !== 8 ||
    patchVersion < 2 ||
    (patchVersion === 2 && prerelease !== undefined)
  ) {
    throw new Error(
      `unsupported RetroCast version ${version}; expected >=0.8.2,<0.9`
    )
  }
}

function parseManifestCount(
  statistics: JsonObject,
  field: "targets" | "candidates"
): number {
  const value = statistics[field]
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(
      `manifest statistics.${field} must be a non-negative integer`
    )
  }
  return value
}

function candidateCount(evaluation: RetrocastEvaluationFile): number {
  return Object.values(evaluation.targets).reduce(
    (count, target) => count + target.candidates.length,
    0
  )
}

function assertBundleCounts(
  manifest: RetrocastManifestFile,
  evaluationRun: RetrocastEvaluationRun,
  targetCount: number,
  candidates: number,
  candidateArtifactTargetCount: number,
  candidateArtifactCandidates: number
): void {
  const counts = [
    [
      "manifest statistics.targets",
      parseManifestCount(manifest.statistics, "targets"),
      targetCount,
    ],
    [
      "manifest statistics.candidates",
      parseManifestCount(manifest.statistics, "candidates"),
      candidates,
    ],
    ["evaluation-run targets", evaluationRun.targets, targetCount],
    ["evaluation-run candidates", evaluationRun.candidates, candidates],
    [
      "candidate artifact target count",
      candidateArtifactTargetCount,
      targetCount,
    ],
    [
      "candidate artifact candidate count",
      candidateArtifactCandidates,
      candidates,
    ],
  ] as const
  for (const [label, actual, expected] of counts) {
    if (actual !== expected) {
      throw new Error(
        `${label} ${actual} does not match evaluation count ${expected}`
      )
    }
  }
}

function satisfiesValidity(
  candidate: RetrocastScoredCandidate,
  tier: RetrocastTier
): boolean {
  if (tier > 0 && (candidate.validity.reaction_assessments?.length ?? 0) > 0) {
    return false
  }
  return candidate.validity.tiers[`${tier}`]?.status === "pass"
}

function metricContribution(
  target: RetrocastTargetEvaluation,
  tier: RetrocastTier,
  solv: boolean,
  statistic: "rate" | "mrr"
): number {
  const passing = target.candidates
    .filter(
      (candidate) =>
        satisfiesValidity(candidate, tier) &&
        (!solv || candidate.constraints.status === "pass")
    )
    .sort((left, right) => left.rank - right.rank)
  if (statistic === "rate") {
    return passing.length > 0 ? 1 : 0
  }
  return passing.length === 0 ? 0 : 1 / (passing[0]?.rank as number)
}

function assertMetric(
  metric: MetricEstimate | undefined,
  targets: RetrocastTargetEvaluation[],
  tier: RetrocastTier,
  solv: boolean,
  statistic: "rate" | "mrr",
  metricKey: string
): void {
  if (!metric) {
    throw new Error(`analysis file is missing ${metricKey}`)
  }
  if (metric.count !== targets.length) {
    throw new Error(
      `${metricKey} count ${metric.count} does not match ${targets.length} evaluation targets`
    )
  }
  const expectedValue =
    targets.length === 0
      ? 0
      : targets.reduce(
          (sum, target) =>
            sum + metricContribution(target, tier, solv, statistic),
          0
        ) / targets.length
  // The fixed floor absorbs producer serialization noise for ordinary runs;
  // the epsilon term grows only for larger target sets instead of making the
  // comparison proportionally lax at today's corpus sizes.
  const tolerance = Math.max(
    1e-12,
    Number.EPSILON * Math.max(1, targets.length)
  )
  if (Math.abs(metric.value - expectedValue) > tolerance) {
    throw new Error(
      `${metricKey} value ${metric.value} does not match evaluation value ${expectedValue}`
    )
  }
}

function assertCanonicalMetrics(
  evaluation: RetrocastEvaluationFile,
  analysis: RetrocastAnalysisFile,
  targets: RetrocastTargetEvaluation[],
  stratum?: string
): void {
  for (const tier of evaluation.tiers) {
    for (const statistic of ["rate", "mrr"] as const) {
      const tierKey = `tier_${tier}_validity_${statistic}`
      const solvKey = `solv_${tier}[${evaluation.metric_label}]_${statistic}`
      assertMetric(
        getTierValidityMetric(analysis, tier, statistic, stratum),
        targets,
        tier,
        false,
        statistic,
        stratum ? `${stratum}.${tierKey}` : tierKey
      )
      assertMetric(
        getSolvMetric(
          analysis,
          tier,
          evaluation.metric_label,
          statistic,
          stratum
        ),
        targets,
        tier,
        true,
        statistic,
        stratum ? `${stratum}.${solvKey}` : solvKey
      )
    }
  }
}

function moleculeDepth(molecule: RetrocastMolecule): number {
  const reaction = molecule.product_of
  if (!reaction) {
    return 0
  }
  return (
    1 +
    reaction.reactants.reduce(
      (maximum, reactant) => Math.max(maximum, moleculeDepth(reactant)),
      0
    )
  )
}

function targetStratum(target: RetrocastTargetEvaluation): string | null {
  const acceptableRoute = target.target.acceptable_routes[0]
  if (acceptableRoute) {
    return `depth ${moleculeDepth(acceptableRoute.target)}`
  }
  const routeDepth = target.effective_constraints.find(
    (constraint) => constraint.kind === "retrocast.route_depth"
  )?.max_depth
  return typeof routeDepth === "string" || typeof routeDepth === "number"
    ? `depth ${routeDepth}`
    : null
}

function assertAnalysisMatchesEvaluation(
  evaluation: RetrocastEvaluationFile,
  analysis: RetrocastAnalysisFile
): void {
  const targets = Object.values(evaluation.targets)
  assertCanonicalMetrics(evaluation, analysis, targets)

  const strata = new Map<string, RetrocastTargetEvaluation[]>()
  for (const target of targets) {
    const label = targetStratum(target)
    if (label !== null) {
      const members = strata.get(label) ?? []
      members.push(target)
      strata.set(label, members)
    }
  }
  for (const [label, members] of strata) {
    if (!analysis.by_stratum[label]) {
      throw new Error(`analysis file is missing derived stratum ${label}`)
    }
    assertCanonicalMetrics(evaluation, analysis, members, label)
  }
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`
  }
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`)
      .join(",")}}`
  }
  const encoded = JSON.stringify(value)
  if (encoded === undefined) {
    throw new Error("candidate payload contains a non-json value")
  }
  return encoded
}

function digestCandidates(candidates: RetrocastCandidate[]): string {
  return createHash("sha256").update(canonicalJson(candidates)).digest("hex")
}

function projectScoredCandidate(
  candidate: RetrocastScoredCandidate
): RetrocastCandidate {
  return candidate.route != null
    ? { rank: candidate.rank, route: candidate.route }
    : { rank: candidate.rank, failure: candidate.failure }
}

async function streamCandidateDigests(file: TrackedFile): Promise<{
  digests: Map<string, CandidateDigest>
  targetCount: number
  candidateCount: number
}> {
  const digests = new Map<string, CandidateDigest>()
  let candidates = 0
  const streamed = await streamJsonObjectEntries(
    file.filePath,
    true,
    async (targetId, value) => {
      if (digests.has(targetId)) {
        throw new Error(
          `candidate artifact contains duplicate target ${targetId}`
        )
      }
      const targetRecord = Object.create(null) as Record<string, unknown>
      targetRecord[targetId] = value
      const parsed = parseCandidatesFile(targetRecord)[targetId] ?? []
      candidates += parsed.length
      digests.set(targetId, {
        count: parsed.length,
        sha256: digestCandidates(parsed),
      })
    },
    { hashInput: true }
  )
  if (!streamed.inputSha256) {
    throw new Error("candidate artifact stream did not produce an input hash")
  }
  assertTrackedFileSha256(file, streamed.inputSha256, "output")
  return {
    digests,
    targetCount: digests.size,
    candidateCount: candidates,
  }
}

function assertCandidateDigests(
  digests: Map<string, CandidateDigest>,
  evaluation: RetrocastEvaluationFile
): void {
  if (digests.size !== Object.keys(evaluation.targets).length) {
    throw new Error(
      "candidate and evaluation files must contain the same target ids"
    )
  }
  for (const [targetId, target] of Object.entries(evaluation.targets)) {
    const candidateDigest = digests.get(targetId)
    if (!candidateDigest) {
      throw new Error(
        `candidate artifact is missing evaluation target ${targetId}`
      )
    }
    const candidates = target.candidates.map(projectScoredCandidate)
    if (
      candidateDigest.count !== candidates.length ||
      candidateDigest.sha256 !== digestCandidates(candidates)
    ) {
      throw new Error(
        `candidate and evaluation payloads differ for target ${targetId}`
      )
    }
  }
}

async function prepareEvaluationBundle(
  rootDir: string,
  options: LoadEvaluationBundleOptions
): Promise<PreparedEvaluationBundle> {
  const verificationPolicy: ArtifactVerificationPolicy =
    options.verification ?? "outputs"
  if (
    verificationPolicy !== "outputs" &&
    verificationPolicy !== "outputs-and-sources"
  ) {
    throw new Error(
      `unsupported artifact verification policy: ${String(verificationPolicy)}`
    )
  }

  const resolvedRoot = await realpath(path.resolve(rootDir))
  if (!(await stat(resolvedRoot)).isDirectory()) {
    throw new Error("evaluation bundle root must be a directory")
  }
  const manifestPath = await resolveRegularFile(
    path.join(resolvedRoot, "manifest.json"),
    "manifest"
  )
  if (!isConfined(resolvedRoot, manifestPath)) {
    throw new Error("evaluation bundle manifest resolves outside its root")
  }
  const manifestArtifact = await readJsonArtifactWithSha256(manifestPath)
  const manifest = parseManifestFile(manifestArtifact.value)
  assertSupportedRetrocastVersion(manifest.retrocast_version)
  if (manifest.action !== "evaluate:v2") {
    throw new Error(
      `evaluation bundle manifest action must be evaluate:v2, got ${manifest.action}`
    )
  }

  const manifestOutputs = manifestOutputFiles(manifest)
  const resolvedOutputs = await Promise.all(
    manifestOutputs.map((info) => resolveBundleOutput(resolvedRoot, info))
  )
  if (new Set(resolvedOutputs).size !== resolvedOutputs.length) {
    throw new Error("evaluation bundle outputs must resolve to distinct files")
  }
  const outputFiles = resolveRequiredOutputFiles(
    manifestOutputs,
    resolvedOutputs
  )
  const trackedOutputs = manifestOutputs.map((info, index) => ({
    info,
    filePath: resolvedOutputs[index] as string,
  }))
  let verifiedSourceFiles: string[] = []
  if (verificationPolicy === "outputs-and-sources") {
    const sourceFiles = await Promise.all(
      manifest.source_files.map(async (info) => ({
        info,
        filePath: await resolveSourceFile(resolvedRoot, info),
      }))
    )
    verifiedSourceFiles = await verifyTrackedFiles(sourceFiles, "source")
  }

  return {
    rootDir: resolvedRoot,
    manifestPath,
    manifestSha256: manifestArtifact.sha256,
    manifest,
    outputFiles,
    trackedOutputs,
    verificationPolicy,
    verifiedSourceFiles,
  }
}

export async function loadEvaluationBundle(
  rootDir: string,
  options: LoadEvaluationBundleOptions = {}
): Promise<VerifiedEvaluationBundle> {
  const prepared = await prepareEvaluationBundle(rootDir, options)
  const [candidateValue, evaluationValue, analysisValue, evaluationRunValue] =
    await Promise.all([
      readVerifiedJsonArtifact(
        requiredTrackedOutput(prepared, "candidates"),
        "output"
      ),
      readVerifiedJsonArtifact(
        requiredTrackedOutput(prepared, "evaluation"),
        "output"
      ),
      readVerifiedJsonArtifact(
        requiredTrackedOutput(prepared, "analysis"),
        "output"
      ),
      readVerifiedJsonArtifact(
        requiredTrackedOutput(prepared, "evaluationRun"),
        "output"
      ),
      verifyExtraOutputs(prepared),
    ])
  const candidatesByTarget = parseCandidatesFile(candidateValue)
  const evaluation = parseEvaluationFile(evaluationValue)
  const analysis = parseAnalysisFile(analysisValue)
  const evaluationRun = parseEvaluationRun(evaluationRunValue)
  assertCandidateAlignment(candidatesByTarget, evaluation)
  const totalCandidates = candidateCount(evaluation)
  assertBundleCounts(
    prepared.manifest,
    evaluationRun,
    Object.keys(evaluation.targets).length,
    totalCandidates,
    Object.keys(candidatesByTarget).length,
    Object.values(candidatesByTarget).reduce(
      (count, candidates) => count + candidates.length,
      0
    )
  )
  assertAnalysisMatchesEvaluation(evaluation, analysis)

  return {
    rootDir: prepared.rootDir,
    manifestSha256: prepared.manifestSha256,
    verification: {
      policy: prepared.verificationPolicy,
      outputFiles: prepared.trackedOutputs.map((output) => output.filePath),
      sourceFiles: prepared.verifiedSourceFiles,
    },
    files: { ...prepared.outputFiles, manifest: prepared.manifestPath },
    manifest: prepared.manifest,
    candidatesByTarget,
    evaluation,
    analysis,
    evaluationRun,
  }
}

export async function loadEvaluationBundleForImport(
  rootDir: string,
  options: LoadEvaluationBundleOptions = {}
): Promise<VerifiedEvaluationBundleForImport> {
  const prepared = await prepareEvaluationBundle(rootDir, options)
  const candidateArtifact = await streamCandidateDigests(
    requiredTrackedOutput(prepared, "candidates")
  )
  const [evaluationValue, analysisValue, evaluationRunValue] =
    await Promise.all([
      readVerifiedJsonArtifact(
        requiredTrackedOutput(prepared, "evaluation"),
        "output"
      ),
      readVerifiedJsonArtifact(
        requiredTrackedOutput(prepared, "analysis"),
        "output"
      ),
      readVerifiedJsonArtifact(
        requiredTrackedOutput(prepared, "evaluationRun"),
        "output"
      ),
      verifyExtraOutputs(prepared),
    ])
  const evaluation = parseEvaluationFile(evaluationValue)
  const analysis = parseAnalysisFile(analysisValue)
  const evaluationRun = parseEvaluationRun(evaluationRunValue)
  assertCandidateDigests(candidateArtifact.digests, evaluation)
  const totalCandidates = candidateCount(evaluation)
  assertBundleCounts(
    prepared.manifest,
    evaluationRun,
    Object.keys(evaluation.targets).length,
    totalCandidates,
    candidateArtifact.targetCount,
    candidateArtifact.candidateCount
  )
  assertAnalysisMatchesEvaluation(evaluation, analysis)

  return {
    rootDir: prepared.rootDir,
    manifestSha256: prepared.manifestSha256,
    verification: {
      policy: prepared.verificationPolicy,
      outputFiles: prepared.trackedOutputs.map((output) => output.filePath),
      sourceFiles: prepared.verifiedSourceFiles,
    },
    files: { ...prepared.outputFiles, manifest: prepared.manifestPath },
    manifest: prepared.manifest,
    evaluation,
    analysis,
    evaluationRun,
    candidateTargetCount: candidateArtifact.targetCount,
    candidateCount: candidateArtifact.candidateCount,
  }
}
