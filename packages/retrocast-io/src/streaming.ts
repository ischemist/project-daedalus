import { createReadStream } from "node:fs"
import { createGunzip } from "node:zlib"

type JsonObjectEntryHandler = (key: string, value: unknown) => Promise<void>

type ParsePhase =
  | "start"
  | "key-or-end"
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
  handleEntry: JsonObjectEntryHandler
): Promise<void> {
  const source = createReadStream(filePath)
  const input = compressed ? source.pipe(createGunzip()) : source
  input.setEncoding("utf8")

  let phase: ParsePhase = "start"
  let keyToken = ""
  let key = ""
  let keyEscaped = false
  let valueParts: string[] = []
  let valueDepth = 0
  let valueInString = false
  let valueEscaped = false
  let complete = false

  for await (const chunk of input) {
    let valueSegmentStart: number | null = phase === "value" ? 0 : null
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
            valueParts.push(chunk.slice(valueSegmentStart, index + 1))
            const valueText = valueParts.join("")
            valueParts = []
            valueSegmentStart = null
            await handleEntry(key, JSON.parse(valueText) as unknown)
            phase = "comma-or-end"
            key = ""
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
        case "key":
          keyToken += character
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
          break
        case "comma-or-end":
          if (character === ",") {
            phase = "key-or-end"
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
      valueParts.push(chunk.slice(valueSegmentStart))
    }
  }

  if (!complete) {
    throw new Error(
      "streamed json payload ended before its object was complete"
    )
  }
}
