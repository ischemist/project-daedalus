import { readFile } from "node:fs/promises"
import { gunzip } from "node:zlib"
import { promisify } from "node:util"

import { parseRetrocastRoutes } from "./projection.js"
import type { RetrocastRoutesByTarget } from "./types.js"

const gunzipAsync = promisify(gunzip)

export async function loadRetrocastRoutesJson(
  path: string
): Promise<RetrocastRoutesByTarget> {
  const content = await readFile(path, "utf8")
  return parseRetrocastRoutes(JSON.parse(content))
}

export async function loadRetrocastRoutesGzip(
  path: string
): Promise<RetrocastRoutesByTarget> {
  const compressed = await readFile(path)
  const content = await gunzipAsync(compressed)
  return parseRetrocastRoutes(JSON.parse(content.toString("utf8")))
}
