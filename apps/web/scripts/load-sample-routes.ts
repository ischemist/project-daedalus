import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { config as loadEnv } from "dotenv"

const scriptDir = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(scriptDir, "../../../.env") })

type Options = {
  file: string
  limitTargets: number
  maxCandidatesPerTarget: number
}

const defaultFile = process.env.SAMPLE_CANDIDATES_FILE ?? ""

function parsePositiveInteger(value: string, label: string): number {
  const parsed = Number.parseInt(value, 10)
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${label} must be a positive integer`)
  }

  return parsed
}

function parseOptions(argv: string[]): Options {
  const options: Options = {
    file: defaultFile,
    limitTargets: 12,
    maxCandidatesPerTarget: 3,
  }

  for (const arg of argv) {
    if (arg === "--") {
      continue
    }

    if (arg.startsWith("--file=")) {
      options.file = arg.slice("--file=".length)
      continue
    }

    if (arg.startsWith("--limit-targets=")) {
      options.limitTargets = parsePositiveInteger(
        arg.slice("--limit-targets=".length),
        "--limit-targets"
      )
      continue
    }

    if (arg.startsWith("--max-candidates-per-target=")) {
      options.maxCandidatesPerTarget = parsePositiveInteger(
        arg.slice("--max-candidates-per-target=".length),
        "--max-candidates-per-target"
      )
      continue
    }

    throw new Error(`unknown argument ${arg}`)
  }

  return options
}

async function main() {
  const options = parseOptions(process.argv.slice(2))
  if (!options.file) {
    throw new Error(
      "missing candidates file: pass --file=/path/to/candidates.json.gz or set SAMPLE_CANDIDATES_FILE"
    )
  }

  const [
    { loadRetrocastCandidatesGzip },
    { projectRetrocastRoute },
    { persistRouteProjection },
    { prisma },
  ] = await Promise.all([
    import("@ischemist/routes/node"),
    import("@ischemist/routes/projection"),
    import("../src/lib/routes/projection-ingest"),
    import("../src/lib/db"),
  ])

  const candidatesByTarget = await loadRetrocastCandidatesGzip(options.file)
  const targetEntries = Object.entries(candidatesByTarget).slice(
    0,
    options.limitTargets
  )
  let createdRoutes = 0
  let reusedRoutes = 0
  let processedRoutes = 0

  for (const [targetId, candidates] of targetEntries) {
    for (const candidate of candidates.slice(
      0,
      options.maxCandidatesPerTarget
    )) {
      if (!candidate.route) {
        continue
      }
      const projection = projectRetrocastRoute(candidate.route, {
        targetId,
        rank: candidate.rank,
      })
      const result = await persistRouteProjection(projection)

      processedRoutes += 1
      if (result.reused) {
        reusedRoutes += 1
      } else {
        createdRoutes += 1
      }
    }
  }

  await prisma.$disconnect()

  console.log(
    JSON.stringify(
      {
        file: options.file,
        targets: targetEntries.length,
        processedRoutes,
        createdRoutes,
        reusedRoutes,
      },
      null,
      2
    )
  )
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
