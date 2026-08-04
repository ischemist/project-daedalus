import assert from "node:assert/strict"
import { Readable } from "node:stream"
import { gzipSync } from "node:zlib"
import test from "node:test"

import {
  streamJsonObjectEntriesFromChunks,
  streamJsonObjectEntriesFromReadable,
} from "../dist/streaming.js"

async function collectEntries(chunks) {
  const entries = []
  await streamJsonObjectEntriesFromChunks(chunks, async (key, value) => {
    entries.push([key, value])
  })
  return entries
}

void test("streams nested entries across every tiny chunk boundary", async () => {
  const document =
    '{"tar\\u0067et \\"one\\"":[{"text":"braces } ] and slash \\\\"},{"nested":[1,{"value":"two"}]}],"other":{"items":[]}}'
  const expected = Object.entries(JSON.parse(document))

  assert.deepEqual(await collectEntries(document.split("")), expected)
  assert.deepEqual(
    await collectEntries([
      document.slice(0, 1),
      document.slice(1, 7),
      document.slice(7, 19),
      document.slice(19),
    ]),
    expected
  )
})

void test("accepts trailing whitespace and rejects trailing content or commas", async () => {
  assert.deepEqual(await collectEntries(['{"target":[]} \n\t']), [
    ["target", []],
  ])
  await assert.rejects(
    collectEntries(['{"target":[]} false']),
    /trailing content/
  )
  await assert.rejects(
    collectEntries(['{"target":[],}']),
    /requires a string key after a comma/
  )
})

void test("rejects primitive target values", async () => {
  for (const primitive of ["null", "true", "1", '"value"']) {
    await assert.rejects(
      collectEntries([`{"target":${primitive}}`]),
      /must be an array or object/
    )
  }
})

void test("rejects truncated and malformed streamed json", async () => {
  for (const malformed of [
    '{"target":[]',
    '{"target" []}',
    '{"target":[}',
    '{"target":[{"text":"unterminated}]}',
    '{"bad\\xkey":[]}',
  ]) {
    await assert.rejects(collectEntries([malformed]))
  }
})

void test("propagates gzip decoding errors through the readable seam", async () => {
  await assert.rejects(
    streamJsonObjectEntriesFromReadable(
      Readable.from([Buffer.from("not gzip")]),
      true,
      async () => {}
    ),
    /incorrect header check/
  )

  const entries = []
  await streamJsonObjectEntriesFromReadable(
    Readable.from([gzipSync('{"target":[]}')]),
    true,
    async (key, value) => {
      entries.push([key, value])
    }
  )
  assert.deepEqual(entries, [["target", []]])
})
