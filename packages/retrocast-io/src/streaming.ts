import { createHash } from "node:crypto"
import { createReadStream } from "node:fs"
import { PassThrough, type Readable, Transform } from "node:stream"
import { pipeline } from "node:stream/promises"
import { createGunzip } from "node:zlib"

type JsonObjectEntryHandler = (key: string, value: unknown) => Promise<void>

export type StreamingJsonObjectLimits = {
  maxKeyCharacters?: number
  maxValueCharacters?: number
}

export type StreamingJsonObjectOptions = StreamingJsonObjectLimits & {
  hashInput?: boolean
}

const DEFAULT_MAX_KEY_CHARACTERS = 64 * 1024
// The largest serialized target entry in the 84-bundle v0.8.2 migration
// corpus is 1,494,049 characters. This 64 MiB cap leaves 44.9x headroom while
// bounding malformed single-target accumulation; the canonical evaluation
// tree remains intentionally resident and is not covered by this limit.
const DEFAULT_MAX_VALUE_CHARACTERS = 64 * 1024 * 1024

type ParsePhase =
  | "start"
  | "key-or-end"
  | "key-required"
  | "key"
  | "colon"
  | "value"
  | "comma-or-end"
  | "done"

function isWhitespace(character: string): boolean {
  return (
    character === " " ||
    character === "\n" ||
    character === "\r" ||
    character === "\t"
  )
}

export async function streamJsonObjectEntries(
  filePath: string,
  compressed: boolean,
  handleEntry: JsonObjectEntryHandler,
  options: StreamingJsonObjectOptions = {}
): Promise<{ inputSha256: string | null }> {
  const source = createReadStream(filePath)
  try {
    return await streamJsonObjectEntriesFromReadable(
      source,
      compressed,
      handleEntry,
      options
    )
  } catch (error) {
    source.destroy()
    throw error
  }
}

export async function streamJsonObjectEntriesFromReadable(
  source: Readable,
  compressed: boolean,
  handleEntry: JsonObjectEntryHandler,
  options: StreamingJsonObjectOptions = {}
): Promise<{ inputSha256: string | null }> {
  const input = compressed ? createGunzip() : new PassThrough()
  const inputHash = options.hashInput ? createHash("sha256") : null
  const hashing = inputHash
    ? new Transform({
        transform(chunk: Buffer, _encoding, callback) {
          inputHash.update(chunk)
          callback(null, chunk)
        },
      })
    : null
  input.setEncoding("utf8")
  let parsingError: unknown
  const parsing = streamJsonObjectEntriesFromChunks(
    input as AsyncIterable<string>,
    handleEntry,
    options
  ).catch((error: unknown) => {
    parsingError = error
    throw error
  })
  const pumping = hashing
    ? pipeline(source, hashing, input)
    : pipeline(source, input)
  try {
    await Promise.all([pumping, parsing])
    return { inputSha256: inputHash?.digest("hex") ?? null }
  } catch (error) {
    source.destroy()
    input.destroy()
    await Promise.allSettled([pumping, parsing])
    throw parsingError ?? error
  }
}

function parseLimit(
  value: number | undefined,
  fallback: number,
  label: string
): number {
  const limit = value ?? fallback
  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new Error(`${label} must be a positive safe integer`)
  }
  return limit
}

function appendValuePart(
  valueParts: string[],
  part: string,
  valueCharacters: number,
  maxValueCharacters: number,
  key: string
): number {
  const nextValueCharacters = valueCharacters + part.length
  if (nextValueCharacters > maxValueCharacters) {
    throw new Error(
      `streamed json object value for ${JSON.stringify(key)} exceeds ${maxValueCharacters} characters`
    )
  }
  valueParts.push(part)
  return nextValueCharacters
}

function streamingLimits(limits: StreamingJsonObjectLimits): {
  maxKeyCharacters: number
  maxValueCharacters: number
} {
  return {
    maxKeyCharacters: parseLimit(
      limits.maxKeyCharacters,
      DEFAULT_MAX_KEY_CHARACTERS,
      "maxKeyCharacters"
    ),
    maxValueCharacters: parseLimit(
      limits.maxValueCharacters,
      DEFAULT_MAX_VALUE_CHARACTERS,
      "maxValueCharacters"
    ),
  }
}

export async function streamJsonObjectEntriesFromChunks(
  chunks: AsyncIterable<string> | Iterable<string>,
  handleEntry: JsonObjectEntryHandler,
  limits: StreamingJsonObjectLimits = {}
): Promise<void> {
  const { maxKeyCharacters, maxValueCharacters } = streamingLimits(limits)
  let phase: ParsePhase = "start"
  let keyToken = ""
  let key = ""
  let keyEscaped = false
  let valueParts: string[] = []
  let valueDepth = 0
  let valueInString = false
  let valueEscaped = false
  let valueStarted = false
  let valueCharacters = 0
  let complete = false

  for await (const chunk of chunks) {
    let valueSegmentStart: number | null =
      phase === "value" && valueStarted ? 0 : null
    for (let index = 0; index < chunk.length; index += 1) {
      const character = chunk[index] as string

      if (phase === "value") {
        if (valueSegmentStart === null) {
          if (isWhitespace(character)) {
            continue
          }
          if (character !== "[" && character !== "{") {
            throw new Error(
              `streamed json object value for ${JSON.stringify(key)} must be an array or object`
            )
          }
          valueSegmentStart = index
          valueStarted = true
        }

        if (valueInString) {
          if (valueEscaped) {
            valueEscaped = false
          } else if (character === "\\") {
            valueEscaped = true
          } else if (character === '"') {
            valueInString = false
          }
        } else if (character === '"') {
          valueInString = true
        } else if (character === "[" || character === "{") {
          valueDepth += 1
        } else if (character === "]" || character === "}") {
          valueDepth -= 1
          if (valueDepth < 0) {
            throw new Error("streamed json object has unbalanced delimiters")
          }
          if (valueDepth === 0) {
            valueCharacters = appendValuePart(
              valueParts,
              chunk.slice(valueSegmentStart, index + 1),
              valueCharacters,
              maxValueCharacters,
              key
            )
            const valueText = valueParts.join("")
            valueParts = []
            valueCharacters = 0
            valueSegmentStart = null
            await handleEntry(key, JSON.parse(valueText) as unknown)
            phase = "comma-or-end"
            key = ""
            valueStarted = false
            continue
          }
        }
        continue
      }

      if (phase !== "key" && isWhitespace(character)) {
        continue
      }
      switch (phase) {
        case "start":
          if (character !== "{") {
            throw new Error("streamed json payload must be an object")
          }
          phase = "key-or-end"
          break
        case "key-or-end":
          if (character === "}") {
            phase = "done"
            complete = true
          } else if (character === '"') {
            keyToken = '"'
            keyEscaped = false
            phase = "key"
          } else {
            throw new Error("streamed json object requires a string key")
          }
          break
        case "key-required":
          if (character !== '"') {
            throw new Error(
              "streamed json object requires a string key after a comma"
            )
          }
          keyToken = '"'
          keyEscaped = false
          phase = "key"
          break
        case "key":
          keyToken += character
          if (keyToken.length > maxKeyCharacters) {
            throw new Error(
              `streamed json object key exceeds ${maxKeyCharacters} characters`
            )
          }
          if (keyEscaped) {
            keyEscaped = false
          } else if (character === "\\") {
            keyEscaped = true
          } else if (character === '"') {
            key = JSON.parse(keyToken) as string
            keyToken = ""
            phase = "colon"
          }
          break
        case "colon":
          if (character !== ":") {
            throw new Error(
              "streamed json object key must be followed by a colon"
            )
          }
          phase = "value"
          valueSegmentStart = null
          valueDepth = 0
          valueInString = false
          valueEscaped = false
          valueStarted = false
          valueCharacters = 0
          break
        case "comma-or-end":
          if (character === ",") {
            phase = "key-required"
          } else if (character === "}") {
            phase = "done"
            complete = true
          } else {
            throw new Error(
              "streamed json object entries must be comma separated"
            )
          }
          break
        case "done":
          throw new Error("streamed json payload contains trailing content")
      }
    }
    if (phase === "value" && valueSegmentStart !== null) {
      valueCharacters = appendValuePart(
        valueParts,
        chunk.slice(valueSegmentStart),
        valueCharacters,
        maxValueCharacters,
        key
      )
    }
  }

  if (!complete) {
    throw new Error(
      "streamed json payload ended before its object was complete"
    )
  }
}
