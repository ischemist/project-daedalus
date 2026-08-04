import { createReadStream } from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"

import type { JsonObject } from "@ischemist/routes"

import { readJsonArtifact } from "./files.js"
import { getSolvMetric, getTierValidityMetric } from "./metrics.js"
import {
  assertCandidateAlignment,
  manifestOutputFiles,
  parseAnalysisFile,
  parseCandidatesFile,
  parseEvaluationFile,
  parseManifestFile,
} from "./parsers.js"
import type {
  ArtifactVerificationPolicy,
  EvaluationBundleFiles,
  LoadEvaluationBundleOptions,
  RetrocastEvaluationFile,
  RetrocastManifestFileInfo,
  VerifiedEvaluationBundle,
} from "./types.js"

const REQUIRED_OUTPUTS = {
  candidates: "candidates.json.gz",
  evaluation: "evaluation.json.gz",
  analysis: "analysis.json.gz",
  evaluationRun: "evaluation-run.json",
} as const

export async function computeFileSha256(filePath: string): Promise<string> {
  const hash = createHash("sha256")
  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk)
  }
  return hash.digest("hex")
}

function resolveBundleOutput(
  rootDir: string,
  file: RetrocastManifestFileInfo
): string {
  if (path.isAbsolute(file.path)) {
    throw new Error(
      `evaluation bundle output path must be relative: ${file.path}`
    )
  }
  const resolved = path.resolve(rootDir, file.path)
  const relative = path.relative(rootDir, resolved)
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`evaluation bundle output escapes its root: ${file.path}`)
  }
  return resolved
}

function resolveRequiredOutputFiles(
  rootDir: string,
  outputs: RetrocastManifestFileInfo[]
): Omit<EvaluationBundleFiles, "manifest"> {
  const resolved = {} as Omit<EvaluationBundleFiles, "manifest">
  for (const [key, fileName] of Object.entries(REQUIRED_OUTPUTS) as [
    keyof typeof REQUIRED_OUTPUTS,
    string,
  ][]) {
    const matches = outputs.filter(
      (file) => path.basename(file.path) === fileName
    )
    if (matches.length !== 1) {
      throw new Error(
        `evaluation bundle manifest must track exactly one ${fileName} output`
      )
    }
    resolved[key] = resolveBundleOutput(
      rootDir,
      matches[0] as RetrocastManifestFileInfo
    )
  }
  return resolved
}

async function verifyTrackedFiles(
  files: { info: RetrocastManifestFileInfo; filePath: string }[],
  label: string
): Promise<string[]> {
  const hashes = await Promise.all(
    files.map(async ({ info, filePath }) => ({
      info,
      filePath,
      actual: await computeFileSha256(filePath),
    }))
  )
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

function resolveSourceFile(
  rootDir: string,
  file: RetrocastManifestFileInfo
): string {
  return path.isAbsolute(file.path)
    ? path.normalize(file.path)
    : path.resolve(rootDir, file.path)
}

function parseJsonObject(value: unknown, label: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a json object`)
  }
  return value as JsonObject
}

function assertRateMatchesEvaluation(
  evaluation: RetrocastEvaluationFile,
  bundle: Pick<VerifiedEvaluationBundle, "analysis">
): void {
  const targets = Object.values(evaluation.targets)
  const targetCount = targets.length
  for (const tier of evaluation.tiers) {
    const validityMetric = getTierValidityMetric(bundle.analysis, tier)
    const solvMetric = getSolvMetric(
      bundle.analysis,
      tier,
      evaluation.metric_label
    )
    if (!validityMetric) {
      throw new Error(`analysis file is missing tier_${tier}_validity_rate`)
    }
    if (!solvMetric) {
      throw new Error(
        `analysis file is missing solv_${tier}[${evaluation.metric_label}]_rate`
      )
    }

    const validitySuccesses = targets.filter((target) =>
      target.candidates.some(
        (candidate) => candidate.validity.tiers[`${tier}`]?.status === "pass"
      )
    ).length
    const solvSuccesses = targets.filter((target) =>
      target.candidates.some(
        (candidate) =>
          candidate.validity.tiers[`${tier}`]?.status === "pass" &&
          candidate.constraints.status === "pass"
      )
    ).length
    assertRate(
      validityMetric.value,
      validityMetric.count,
      validitySuccesses,
      targetCount,
      `tier_${tier}_validity_rate`
    )
    assertRate(
      solvMetric.value,
      solvMetric.count,
      solvSuccesses,
      targetCount,
      `solv_${tier}[${evaluation.metric_label}]_rate`
    )
  }
}

function assertRate(
  actualValue: number,
  actualCount: number,
  successes: number,
  targetCount: number,
  metricKey: string
): void {
  if (actualCount !== targetCount) {
    throw new Error(
      `${metricKey} count ${actualCount} does not match ${targetCount} evaluation targets`
    )
  }
  const expectedValue = targetCount === 0 ? 0 : successes / targetCount
  if (Math.abs(actualValue - expectedValue) > Number.EPSILON * 8) {
    throw new Error(
      `${metricKey} value ${actualValue} does not match evaluation value ${expectedValue}`
    )
  }
}

export async function loadEvaluationBundle(
  rootDir: string,
  options: LoadEvaluationBundleOptions = {}
): Promise<VerifiedEvaluationBundle> {
  const resolvedRoot = path.resolve(rootDir)
  const manifestPath = path.join(resolvedRoot, "manifest.json")
  const [manifestValue, manifestSha256] = await Promise.all([
    readJsonArtifact(manifestPath),
    computeFileSha256(manifestPath),
  ])
  const manifest = parseManifestFile(manifestValue)
  if (manifest.action !== "evaluate:v2") {
    throw new Error(
      `evaluation bundle manifest action must be evaluate:v2, got ${manifest.action}`
    )
  }

  const manifestOutputs = manifestOutputFiles(manifest)
  const outputFiles = resolveRequiredOutputFiles(resolvedRoot, manifestOutputs)
  const verifiedOutputFiles = await verifyTrackedFiles(
    manifestOutputs.map((info) => ({
      info,
      filePath: resolveBundleOutput(resolvedRoot, info),
    })),
    "output"
  )
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
  const verifiedSourceFiles =
    verificationPolicy === "outputs-and-sources"
      ? await verifyTrackedFiles(
          manifest.source_files.map((info) => ({
            info,
            filePath: resolveSourceFile(resolvedRoot, info),
          })),
          "source"
        )
      : []

  const [candidateValue, evaluationValue, analysisValue, evaluationRunValue] =
    await Promise.all([
      readJsonArtifact(outputFiles.candidates),
      readJsonArtifact(outputFiles.evaluation),
      readJsonArtifact(outputFiles.analysis),
      readJsonArtifact(outputFiles.evaluationRun),
    ])
  const candidatesByTarget = parseCandidatesFile(candidateValue)
  const evaluation = parseEvaluationFile(evaluationValue)
  const analysis = parseAnalysisFile(analysisValue)
  assertCandidateAlignment(candidatesByTarget, evaluation)

  const bundle: VerifiedEvaluationBundle = {
    rootDir: resolvedRoot,
    manifestSha256,
    verification: {
      policy: verificationPolicy,
      outputFiles: verifiedOutputFiles,
      sourceFiles: verifiedSourceFiles,
    },
    files: { ...outputFiles, manifest: manifestPath },
    manifest,
    candidatesByTarget,
    evaluation,
    analysis,
    evaluationRun: parseJsonObject(evaluationRunValue, "evaluation-run file"),
  }
  assertRateMatchesEvaluation(evaluation, bundle)
  return bundle
}
