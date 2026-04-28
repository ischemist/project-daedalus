import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { config as loadEnv } from "dotenv"

const scriptDir = dirname(fileURLToPath(import.meta.url))
loadEnv({ path: resolve(scriptDir, "../../../.env") })

type Options = {
  file: string
  limitTargets: number
  maxRoutesPerTarget: number
}

const defaultFile = process.env.SAMPLE_ROUTES_FILE ?? ""

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
    maxRoutesPerTarget: 3,
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

    if (arg.startsWith("--max-routes-per-target=")) {
      options.maxRoutesPerTarget = parsePositiveInteger(
        arg.slice("--max-routes-per-target=".length),
        "--max-routes-per-target"
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
      "missing routes file: pass --file=/path/to/routes.json.gz or set SAMPLE_ROUTES_FILE"
    )
  }

  const [
    { loadRetrocastRoutesGzip },
    { projectRetrocastRoute },
    { persistRouteProjection },
    { prisma },
  ] = await Promise.all([
    import("@ischemist/routes/node"),
    import("@ischemist/routes/projection"),
    import("../src/lib/routes/projection-ingest"),
    import("../src/lib/db"),
  ])

  const routesByTarget = await loadRetrocastRoutesGzip(options.file)
  const targetEntries = Object.entries(routesByTarget).slice(
    0,
    options.limitTargets
  )
  let createdRoutes = 0
  let reusedRoutes = 0
  let processedRoutes = 0

  for (const [targetId, routes] of targetEntries) {
    for (const route of routes.slice(0, options.maxRoutesPerTarget)) {
      const projection = projectRetrocastRoute(route, { targetId })
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
