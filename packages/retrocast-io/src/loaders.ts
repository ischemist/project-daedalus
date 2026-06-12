import path from "node:path"

import { parseRetrocastCandidates } from "@ischemist/routes"
import type {
  RetrocastCandidate,
  RetrocastCandidatesByTarget,
  JsonObject,
  RetrocastRoute,
} from "@ischemist/routes"

import { pathExists, readJsonArtifact, readJsonObject } from "./files.js"
import type {
  BenchmarkDefinition,
  BenchmarkTargetDefinition,
  LoadBenchmarkDefinitionOptions,
  RetrocastAnalysisFile,
  RetrocastEvaluationFile,
  RetrocastManifestFile,
  RetrocastScoredCandidate,
  RetrocastTargetEvaluation,
} from "./types.js"

export { computeRootReactionSignature as getRootReactionSignature } from "@ischemist/routes"

function assertObject(
  value: unknown,
  label: string
): asserts value is JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be a json object`)
  }
}

function assertBenchmarkTarget(
  value: unknown,
  label: string
): asserts value is BenchmarkTargetDefinition {
  assertObject(value, label)
  if (typeof value.id !== "string") {
    throw new Error(`${label}.id must be a string`)
  }
  if (typeof value.smiles !== "string") {
    throw new Error(`${label}.smiles must be a string`)
  }
  if (typeof value.inchikey !== "string") {
    throw new Error(`${label}.inchikey must be a string`)
  }
  if (!Array.isArray(value.acceptable_routes)) {
    throw new Error(`${label}.acceptable_routes must be an array`)
  }
}

function parseBenchmarkDefinition(value: unknown): BenchmarkDefinition {
  assertObject(value, "benchmark definition")
  if (typeof value.name !== "string") {
    throw new Error("benchmark definition name must be a string")
  }
  if (value.schema_version !== "2") {
    throw new Error('benchmark definition schema_version must be "2"')
  }
  assertObject(value.targets, "benchmark definition targets")

  for (const [targetId, target] of Object.entries(value.targets)) {
    assertBenchmarkTarget(target, `benchmark target ${targetId}`)
  }

  return value as BenchmarkDefinition
}

function parseEvaluationFile(value: unknown): RetrocastEvaluationFile {
  assertObject(value, "evaluation file")
  if (value.schema_version !== "2") {
    throw new Error('evaluation file schema_version must be "2"')
  }
  assertObject(value.task, "evaluation file task")
  assertObject(value.targets, "evaluation file targets")
  return value as RetrocastEvaluationFile
}

function parseAnalysisFile(value: unknown): RetrocastAnalysisFile {
  assertObject(value, "analysis file")
  if (value.schema_version !== "2") {
    throw new Error('analysis file schema_version must be "2"')
  }
  assertObject(value.metrics, "analysis file metrics")
  return value as RetrocastAnalysisFile
}

function benchmarkNameCandidates(name: string): string[] {
  const withoutPrompt = name.replace(/-prompt=[^/]+$/, "")
  const withoutPrefix = name.replace(/^rc-/, "")
  const withoutBoth = withoutPrompt.replace(/^rc-/, "")
  return Array.from(new Set([name, withoutPrompt, withoutPrefix, withoutBoth]))
}

function benchmarkDefinitionsDirectories(
  options: LoadBenchmarkDefinitionOptions
): string[] {
  const directories = []
  if (options.benchmarkDefinitionsDir) {
    directories.push(options.benchmarkDefinitionsDir)
  }
  if (options.rootDir) {
    directories.push(
      path.join(
        options.rootDir,
        "data",
        "retrocast",
        "1-benchmarks",
        "definitions"
      ),
      path.join(options.rootDir, "1-benchmarks", "definitions")
    )
  }
  return directories
}

export async function loadCandidatesFile(
  filePath: string
): Promise<RetrocastCandidatesByTarget> {
  return parseRetrocastCandidates(await readJsonArtifact(filePath))
}

export async function loadEvaluationFile(
  filePath: string
): Promise<RetrocastEvaluationFile> {
  return parseEvaluationFile(await readJsonArtifact(filePath))
}

export async function loadAnalysisFile(
  filePath: string
): Promise<RetrocastAnalysisFile> {
  return parseAnalysisFile(await readJsonArtifact(filePath))
}

export async function loadManifestFile(
  filePath: string
): Promise<RetrocastManifestFile> {
  const value = await readJsonArtifact(filePath)
  assertObject(value, "manifest file")
  return value as RetrocastManifestFile
}

export async function loadAriadneMetadataFile(
  filePath: string
): Promise<JsonObject> {
  return readJsonObject(filePath)
}

export async function loadBenchmarkDefinition(
  pathOrName: string,
  options: LoadBenchmarkDefinitionOptions = {}
): Promise<BenchmarkDefinition> {
  if (path.isAbsolute(pathOrName) || pathOrName.includes(path.sep)) {
    return parseBenchmarkDefinition(await readJsonArtifact(pathOrName))
  }

  const candidates = benchmarkNameCandidates(pathOrName).flatMap((name) => [
    `${name}.json.gz`,
    `${name}.json`,
  ])

  for (const directory of benchmarkDefinitionsDirectories(options)) {
    for (const candidate of candidates) {
      const candidatePath = path.join(directory, candidate)
      if (await pathExists(candidatePath)) {
        return parseBenchmarkDefinition(await readJsonArtifact(candidatePath))
      }
    }
  }

  throw new Error(`could not resolve benchmark definition ${pathOrName}`)
}

export function getCandidateByRank(
  candidates: RetrocastCandidate[],
  rank: number
): RetrocastCandidate | undefined {
  return candidates.find((candidate) => candidate.rank === rank)
}

export function getAcceptableRank(
  evaluation: RetrocastTargetEvaluation | undefined
): number | null {
  const match = evaluation?.candidates.find(
    (candidate) => candidate.matches_acceptable
  )
  return match?.rank ?? null
}

export function getFirstMatchingRoute(
  candidates: RetrocastCandidate[],
  evaluation: RetrocastTargetEvaluation | undefined
): RetrocastRoute | undefined {
  const rank = getAcceptableRank(evaluation)
  const candidate =
    rank == null ? undefined : getCandidateByRank(candidates, rank)
  return candidate?.route ?? undefined
}

export function getScoredCandidateByRank(
  evaluation: RetrocastTargetEvaluation | undefined,
  rank: number
): RetrocastScoredCandidate | undefined {
  return evaluation?.candidates.find((candidate) => candidate.rank === rank)
}
