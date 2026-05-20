import path from "node:path"

import { parseRetrocastRoutes } from "@ischemist/routes"
import type {
  JsonObject,
  RetrocastRoute,
  RetrocastRoutesByTarget,
} from "@ischemist/routes"

import { pathExists, readJsonArtifact, readJsonObject } from "./files.js"
import type {
  BenchmarkDefinition,
  BenchmarkTargetDefinition,
  LoadBenchmarkDefinitionOptions,
  RetrocastEvaluationFile,
  RetrocastManifestFile,
  RetrocastRouteEvaluation,
  RetrocastStatisticsFile,
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
  if (!Array.isArray(value.acceptable_routes)) {
    throw new Error(`${label}.acceptable_routes must be an array`)
  }
}

function parseBenchmarkDefinition(value: unknown): BenchmarkDefinition {
  assertObject(value, "benchmark definition")
  if (typeof value.name !== "string") {
    throw new Error("benchmark definition name must be a string")
  }
  assertObject(value.targets, "benchmark definition targets")

  for (const [targetId, target] of Object.entries(value.targets)) {
    assertBenchmarkTarget(target, `benchmark target ${targetId}`)
  }

  return value as BenchmarkDefinition
}

function parseEvaluationFile(value: unknown): RetrocastEvaluationFile {
  assertObject(value, "evaluation file")
  if (typeof value.model_name !== "string") {
    throw new Error("evaluation file model_name must be a string")
  }
  if (typeof value.benchmark_name !== "string") {
    throw new Error("evaluation file benchmark_name must be a string")
  }
  if (typeof value.stock_name !== "string") {
    throw new Error("evaluation file stock_name must be a string")
  }
  assertObject(value.results, "evaluation file results")
  return value as RetrocastEvaluationFile
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

export async function loadRoutesFile(
  filePath: string
): Promise<RetrocastRoutesByTarget> {
  return parseRetrocastRoutes(await readJsonArtifact(filePath))
}

export async function loadEvaluationFile(
  filePath: string
): Promise<RetrocastEvaluationFile> {
  return parseEvaluationFile(await readJsonArtifact(filePath))
}

export async function loadStatisticsFile(
  filePath: string
): Promise<RetrocastStatisticsFile> {
  const value = await readJsonArtifact(filePath)
  assertObject(value, "statistics file")
  return value as RetrocastStatisticsFile
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

export function getPredictionByRank(
  routes: RetrocastRoute[],
  rank: number
): RetrocastRoute | undefined {
  return routes.find((route, index) => (route.rank ?? index + 1) === rank)
}

export function getAcceptableRank(
  evaluation: RetrocastTargetEvaluation | undefined
): number | null {
  const match = evaluation?.routes.find((route) => route.matches_acceptable)
  return match?.rank ?? null
}

export function getFirstMatchingPrediction(
  routes: RetrocastRoute[],
  evaluation: RetrocastTargetEvaluation | undefined
): RetrocastRoute | undefined {
  const rank = getAcceptableRank(evaluation)
  return rank == null ? undefined : getPredictionByRank(routes, rank)
}

export function getRouteEvaluationByRank(
  evaluation: RetrocastTargetEvaluation | undefined,
  rank: number
): RetrocastRouteEvaluation | undefined {
  return evaluation?.routes.find((route) => route.rank === rank)
}
