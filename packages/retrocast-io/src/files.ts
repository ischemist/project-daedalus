import { access, readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { gunzip } from "node:zlib"
import { promisify } from "node:util"

import type { JsonObject } from "@ischemist/routes"

const gunzipAsync = promisify(gunzip)
const SKIPPED_DIRECTORIES = new Set([".git", ".next", "dist", "node_modules"])

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

export async function readJsonArtifact(
  pathOrFileUrl: string
): Promise<unknown> {
  const filePath = pathOrFileUrl.startsWith("file:")
    ? new URL(pathOrFileUrl)
    : pathOrFileUrl
  const content = await readFile(filePath)
  const text = pathOrFileUrl.endsWith(".gz")
    ? (await gunzipAsync(content)).toString("utf8")
    : content.toString("utf8")

  return JSON.parse(text) as unknown
}

export async function readJsonObject(
  pathOrFileUrl: string
): Promise<JsonObject> {
  const value = await readJsonArtifact(pathOrFileUrl)
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${pathOrFileUrl} must contain a json object`)
  }
  return value as JsonObject
}

export async function findFilesByName(
  rootDir: string,
  fileName: string
): Promise<string[]> {
  const results: string[] = []

  async function visit(directory: string): Promise<void> {
    let entries
    try {
      entries = await readdir(directory, { withFileTypes: true })
    } catch {
      return
    }

    await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name)
        if (entry.isDirectory()) {
          if (!SKIPPED_DIRECTORIES.has(entry.name)) {
            await visit(entryPath)
          }
          return
        }

        if (entry.isFile() && entry.name === fileName) {
          results.push(entryPath)
        }
      })
    )
  }

  await visit(rootDir)
  return results.sort((a, b) => a.localeCompare(b))
}
