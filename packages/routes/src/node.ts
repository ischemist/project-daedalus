import { readFile } from "node:fs/promises"
import { gunzip } from "node:zlib"
import { promisify } from "node:util"

import { parseRetrocastCandidates } from "./projection.js"
import type { RetrocastCandidatesByTarget } from "./types.js"

const gunzipAsync = promisify(gunzip)

export async function loadRetrocastCandidatesJson(
  path: string
): Promise<RetrocastCandidatesByTarget> {
  const content = await readFile(path, "utf8")
  return parseRetrocastCandidates(JSON.parse(content))
}

export async function loadRetrocastCandidatesGzip(
  path: string
): Promise<RetrocastCandidatesByTarget> {
  const compressed = await readFile(path)
  const content = await gunzipAsync(compressed)
  return parseRetrocastCandidates(JSON.parse(content.toString("utf8")))
}
