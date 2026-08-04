import { createHash } from "node:crypto"
import { access, open, readdir, type FileHandle } from "node:fs/promises"
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
  const handle = await open(filePath, "r")
  try {
    return (
      await readJsonArtifactFromFileHandle(
        handle,
        pathOrFileUrl.endsWith(".gz")
      )
    ).value
  } finally {
    await handle.close()
  }
}

export async function readJsonArtifactFromFileHandle(
  handle: FileHandle,
  compressed: boolean
): Promise<{ value: unknown; sha256: string }> {
  const artifact = await readArtifactFromFileHandle(handle)
  return {
    value: await parseJsonArtifactBytes(artifact.content, compressed),
    sha256: artifact.sha256,
  }
}

export async function readArtifactFromFileHandle(
  handle: FileHandle
): Promise<{ content: Buffer; sha256: string }> {
  const content = await handle.readFile()
  const sha256 = createHash("sha256").update(content).digest("hex")
  return { content, sha256 }
}

export async function parseJsonArtifactBytes(
  content: Buffer,
  compressed: boolean
): Promise<unknown> {
  const text = compressed
    ? (await gunzipAsync(content)).toString("utf8")
    : content.toString("utf8")

  return JSON.parse(text) as unknown
}

export async function readArtifactWithSha256(
  filePath: string
): Promise<{ content: Buffer; sha256: string }> {
  const handle = await open(filePath, "r")
  try {
    return await readArtifactFromFileHandle(handle)
  } finally {
    await handle.close()
  }
}

export async function readJsonArtifactWithSha256(
  filePath: string
): Promise<{ value: unknown; sha256: string }> {
  const artifact = await readArtifactWithSha256(filePath)
  return {
    value: await parseJsonArtifactBytes(
      artifact.content,
      filePath.endsWith(".gz")
    ),
    sha256: artifact.sha256,
  }
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
  return findFilesByNames(rootDir, [fileName])
}

export async function findFilesByNames(
  rootDir: string,
  fileNames: Iterable<string>
): Promise<string[]> {
  const results: string[] = []
  const fileNameSet = new Set(fileNames)

  async function visit(directory: string): Promise<void> {
    let entries
    try {
      entries = await readdir(directory, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(entry.name)) {
          await visit(entryPath)
        }
        continue
      }

      if (entry.isFile() && fileNameSet.has(entry.name)) {
        results.push(entryPath)
      }
    }
  }

  await visit(rootDir)
  return results.sort((a, b) => a.localeCompare(b))
}
