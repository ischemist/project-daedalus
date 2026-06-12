import path from "node:path"

import { findFilesByNames, pathExists } from "./files.js"
import {
  loadAriadneMetadataFile,
  loadAnalysisFile,
  loadBenchmarkDefinition,
  loadCandidatesFile,
  loadEvaluationFile,
  loadManifestFile,
} from "./loaders.js"
import type {
  LoadTargetAuditBundleOptions,
  RetrocastCheckpointBundle,
  ScanAriadneWorkspaceOptions,
  TargetAuditBundle,
  WorkspaceRunDescriptor,
} from "./types.js"

type ParsedExportPath = {
  retrocastExportPath: string
  logbookPath: string
  stage: string
  benchmarkName: string
  checkpointLabel: string
  scoreLabel?: string
}

function parseExportPath(filePath: string): ParsedExportPath | null {
  const parts = filePath.split(path.sep)
  const exportIndex = parts.lastIndexOf("retrocast_export")
  if (exportIndex < 0) {
    return null
  }

  const evaluationsIndex = parts.lastIndexOf("evaluations")
  if (evaluationsIndex < 0 || evaluationsIndex > exportIndex) {
    return null
  }

  const stage = parts[exportIndex + 1]
  const benchmarkName = parts[exportIndex + 2]
  const checkpointLabel = parts[exportIndex + 3]
  if (!stage || !benchmarkName || !checkpointLabel) {
    return null
  }

  const scoreLabel =
    stage === "4-scored" || stage === "5-results"
      ? parts[exportIndex + 4]
      : undefined

  return {
    retrocastExportPath: parts.slice(0, exportIndex + 1).join(path.sep),
    logbookPath: parts.slice(0, evaluationsIndex).join(path.sep),
    stage,
    benchmarkName,
    checkpointLabel,
    scoreLabel,
  }
}

function inferFamily(runSlug: string): string {
  if (/(^|-)causal(-|$)/.test(runSlug)) return "causal"
  if (/(^|-)prefix(-|$)/.test(runSlug)) return "prefix"
  return "unknown"
}

function inferSplit(benchmarkName: string): string {
  if (/(^|-)rea(-|$)/.test(benchmarkName)) return "rea"
  if (/(^|-)rou(-|$)/.test(benchmarkName)) return "rou"
  return "unknown"
}

function inferPrompt(benchmarkName: string): string {
  return benchmarkName.match(/prompt=([^/]+)/)?.[1] ?? "unknown"
}

async function optionalPath(filePath: string): Promise<string | undefined> {
  return (await pathExists(filePath)) ? filePath : undefined
}

async function optionalJsonArtifactPath(
  filePathWithoutExtension: string
): Promise<string | undefined> {
  return (
    (await optionalPath(`${filePathWithoutExtension}.json.gz`)) ??
    (await optionalPath(`${filePathWithoutExtension}.json`))
  )
}

function isNamedJsonArtifact(filePath: string, baseName: string): boolean {
  const fileName = path.basename(filePath)
  return fileName === `${baseName}.json.gz` || fileName === `${baseName}.json`
}

function descriptorKey(descriptor: WorkspaceRunDescriptor): string {
  return [
    descriptor.logbookPath,
    descriptor.benchmarkName,
    descriptor.checkpointLabel,
    descriptor.scoreLabel,
  ].join("\0")
}

function sortDescriptors(
  descriptors: WorkspaceRunDescriptor[]
): WorkspaceRunDescriptor[] {
  return descriptors.sort((a, b) => {
    const run = a.runSlug.localeCompare(b.runSlug)
    if (run !== 0) return run
    const benchmark = a.benchmarkName.localeCompare(b.benchmarkName)
    if (benchmark !== 0) return benchmark
    const checkpoint = a.checkpointLabel.localeCompare(
      b.checkpointLabel,
      undefined,
      {
        numeric: true,
      }
    )
    if (checkpoint !== 0) return checkpoint
    return a.scoreLabel.localeCompare(b.scoreLabel)
  })
}

async function descriptorFromAnalysisPath(
  rootDir: string,
  analysisPath: string
): Promise<WorkspaceRunDescriptor | null> {
  const parsed = parseExportPath(analysisPath)
  if (!parsed || parsed.stage !== "5-results" || !parsed.scoreLabel) {
    return null
  }

  const runSlug = path.basename(parsed.logbookPath)
  const processedCandidatesPath = await optionalJsonArtifactPath(
    path.join(
      parsed.retrocastExportPath,
      "3-processed",
      parsed.benchmarkName,
      parsed.checkpointLabel,
      "candidates"
    )
  )
  if (!processedCandidatesPath) {
    return null
  }

  const evaluationPath = await optionalJsonArtifactPath(
    path.join(
      parsed.retrocastExportPath,
      "4-scored",
      parsed.benchmarkName,
      parsed.checkpointLabel,
      parsed.scoreLabel,
      "evaluation"
    )
  )
  const resultDirectory = path.dirname(analysisPath)

  return {
    rootDir,
    logbookPath: parsed.logbookPath,
    retrocastExportPath: parsed.retrocastExportPath,
    runSlug,
    family: inferFamily(runSlug),
    split: inferSplit(parsed.benchmarkName),
    prompt: inferPrompt(parsed.benchmarkName),
    checkpointLabel: parsed.checkpointLabel,
    scoreLabel: parsed.scoreLabel,
    benchmarkName: parsed.benchmarkName,
    processedCandidatesPath,
    evaluationPath,
    analysisPath,
    manifestPath: await optionalPath(
      path.join(resultDirectory, "manifest.json")
    ),
    ariadneMetadataPath: await optionalPath(
      path.join(resultDirectory, "ariadne_metadata.json")
    ),
  }
}

async function descriptorFromCandidatesPath(
  rootDir: string,
  candidatesPath: string
): Promise<WorkspaceRunDescriptor | null> {
  const parsed = parseExportPath(candidatesPath)
  if (!parsed || parsed.stage !== "3-processed") {
    return null
  }

  const runSlug = path.basename(parsed.logbookPath)
  return {
    rootDir,
    logbookPath: parsed.logbookPath,
    retrocastExportPath: parsed.retrocastExportPath,
    runSlug,
    family: inferFamily(runSlug),
    split: inferSplit(parsed.benchmarkName),
    prompt: inferPrompt(parsed.benchmarkName),
    checkpointLabel: parsed.checkpointLabel,
    scoreLabel: "unknown",
    benchmarkName: parsed.benchmarkName,
    processedCandidatesPath: candidatesPath,
  }
}

function shouldKeepDescriptor(
  descriptor: WorkspaceRunDescriptor,
  options: ScanAriadneWorkspaceOptions
): boolean {
  return (
    options.includeArchive === true ||
    !descriptor.logbookPath.includes("/archive/")
  )
}

export async function scanAriadneWorkspace(
  rootDir: string,
  options: ScanAriadneWorkspaceOptions = {}
): Promise<WorkspaceRunDescriptor[]> {
  const artifactPaths = await findFilesByNames(rootDir, [
    "analysis.json.gz",
    "analysis.json",
    "candidates.json.gz",
    "candidates.json",
  ])
  const analysisPaths = artifactPaths.filter((artifactPath) =>
    isNamedJsonArtifact(artifactPath, "analysis")
  )
  const descriptors = new Map<string, WorkspaceRunDescriptor>()

  for (const analysisPath of analysisPaths) {
    const descriptor = await descriptorFromAnalysisPath(rootDir, analysisPath)
    if (descriptor && shouldKeepDescriptor(descriptor, options)) {
      descriptors.set(descriptorKey(descriptor), descriptor)
    }
  }

  const coveredCandidatesPaths = new Set(
    Array.from(descriptors.values()).map(
      (descriptor) => descriptor.processedCandidatesPath
    )
  )
  const candidatesPaths = artifactPaths.filter((artifactPath) =>
    isNamedJsonArtifact(artifactPath, "candidates")
  )
  for (const candidatesPath of candidatesPaths) {
    const descriptor = await descriptorFromCandidatesPath(
      rootDir,
      candidatesPath
    )
    if (
      descriptor &&
      shouldKeepDescriptor(descriptor, options) &&
      !coveredCandidatesPaths.has(candidatesPath)
    ) {
      descriptors.set(descriptorKey(descriptor), descriptor)
      coveredCandidatesPaths.add(candidatesPath)
    }
  }

  return sortDescriptors(Array.from(descriptors.values()))
}

export const listRunDescriptors = scanAriadneWorkspace

export async function loadCheckpointBundle(
  descriptor: WorkspaceRunDescriptor
): Promise<RetrocastCheckpointBundle> {
  const [
    candidatesByTarget,
    evaluation,
    analysis,
    manifest,
    ariadneMetadata,
    benchmark,
  ] = await Promise.all([
    loadCandidatesFile(descriptor.processedCandidatesPath),
    descriptor.evaluationPath
      ? loadEvaluationFile(descriptor.evaluationPath)
      : Promise.resolve(undefined),
    descriptor.analysisPath
      ? loadAnalysisFile(descriptor.analysisPath)
      : Promise.resolve(undefined),
    descriptor.manifestPath
      ? loadManifestFile(descriptor.manifestPath)
      : Promise.resolve(undefined),
    descriptor.ariadneMetadataPath
      ? loadAriadneMetadataFile(descriptor.ariadneMetadataPath)
      : Promise.resolve(undefined),
    loadBenchmarkDefinition(descriptor.benchmarkName, {
      rootDir: descriptor.rootDir,
    }).catch(() => undefined),
  ])

  return {
    descriptor,
    benchmark,
    candidatesByTarget,
    evaluation,
    analysis,
    manifest,
    ariadneMetadata,
  }
}

export async function loadTargetAuditBundle({
  rootDir,
  targetId,
  descriptors,
  benchmarkName,
  scoreLabel,
}: LoadTargetAuditBundleOptions): Promise<TargetAuditBundle> {
  const selectedDescriptors = (
    descriptors ?? (await scanAriadneWorkspace(rootDir))
  ).filter(
    (descriptor) =>
      (!benchmarkName || descriptor.benchmarkName === benchmarkName) &&
      (!scoreLabel || descriptor.scoreLabel === scoreLabel)
  )

  const benchmarkNames = new Set(
    selectedDescriptors.map((descriptor) => descriptor.benchmarkName)
  )
  const resolvedBenchmarkName =
    benchmarkName ??
    (benchmarkNames.size === 1 ? [...benchmarkNames][0] : undefined)
  const benchmark = resolvedBenchmarkName
    ? await loadBenchmarkDefinition(resolvedBenchmarkName, { rootDir }).catch(
        () => undefined
      )
    : undefined
  const benchmarkTarget = benchmark?.targets[targetId]
  const predictions = await Promise.all(
    selectedDescriptors.map(async (descriptor) => {
      const [candidatesByTarget, evaluationFile] = await Promise.all([
        loadCandidatesFile(descriptor.processedCandidatesPath),
        descriptor.evaluationPath
          ? loadEvaluationFile(descriptor.evaluationPath)
          : Promise.resolve(undefined),
      ])

      const candidates = candidatesByTarget[targetId] ?? []
      return {
        run: descriptor,
        candidates,
        routes: candidates.flatMap((candidate) =>
          candidate.route ? [candidate.route] : []
        ),
        evaluation: evaluationFile?.targets[targetId],
      }
    })
  )

  return {
    targetId,
    benchmarkTarget,
    acceptableRoutes: benchmarkTarget?.acceptable_routes ?? [],
    predictions,
  }
}

export function getBenchmarkNameWithoutPrompt(benchmarkName: string): string {
  return benchmarkName.replace(/^rc-/, "").replace(/-prompt=[^/]+$/, "")
}
