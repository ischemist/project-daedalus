import path from "node:path"

import type {
  RetrocastCandidate,
  RetrocastCandidatesByTarget,
  JsonObject,
  RetrocastRoute,
} from "@ischemist/routes"

import { pathExists, readJsonArtifact, readJsonObject } from "./files.js"
import {
  parseAnalysisFile,
  parseBenchmarkDefinition,
  parseCandidatesFile,
  parseEvaluationFile,
  parseManifestFile,
} from "./parsers.js"
import type {
  BenchmarkDefinition,
  LoadBenchmarkDefinitionOptions,
  RetrocastAnalysisFile,
  RetrocastEvaluationFile,
  RetrocastManifestFile,
  RetrocastScoredCandidate,
  RetrocastTargetEvaluation,
} from "./types.js"

export { computeRootReactionSignature as getRootReactionSignature } from "@ischemist/routes"

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
  return parseCandidatesFile(await readJsonArtifact(filePath))
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
  return parseManifestFile(await readJsonArtifact(filePath))
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
