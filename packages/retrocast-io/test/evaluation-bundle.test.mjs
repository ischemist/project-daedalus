import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { gzipSync } from "node:zlib"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import test from "node:test"

import {
  assertCandidateAlignment,
  getSolvMetric,
  getTierValidityMetric,
  loadEvaluationBundle,
  parseAnalysisFile,
  parseCandidatesFile,
  parseCanonicalMetricKey,
  parseEvaluationFile,
  solvMetricKey,
  tierValidityMetricKey,
} from "../dist/index.js"
import { createEvaluateV2Fixture } from "./fixtures/evaluate-v2.mjs"

function sha256(content) {
  return createHash("sha256").update(content).digest("hex")
}

async function writeFixtureBundle(transform = (fixture) => fixture) {
  const rootDir = await mkdtemp(path.join(tmpdir(), "retrocast-io-test-"))
  const fixture = transform(createEvaluateV2Fixture())
  const artifacts = {
    "candidates.json.gz": gzipSync(JSON.stringify(fixture.candidates)),
    "evaluation.json.gz": gzipSync(JSON.stringify(fixture.evaluation)),
    "analysis.json.gz": gzipSync(JSON.stringify(fixture.analysis)),
    "evaluation-run.json": Buffer.from(JSON.stringify(fixture.evaluationRun)),
  }
  await Promise.all(
    Object.entries(artifacts).map(([fileName, content]) =>
      writeFile(path.join(rootDir, fileName), content)
    )
  )
  const sourceContent = Buffer.from("raw planner output\n")
  await writeFile(path.join(rootDir, "raw-results.json"), sourceContent)
  const manifest = {
    schema_version: "2",
    retrocast_version: "0.8.2",
    created_at: "2026-08-04T00:00:00Z",
    action: "evaluate:v2",
    parameters: { mode: "strict" },
    directives: {},
    source_files: [{ path: "raw-results.json", sha256: sha256(sourceContent) }],
    output_files: Object.entries(artifacts).map(([fileName, content]) => ({
      path: fileName,
      sha256: sha256(content),
    })),
    statistics: { targets: 2, candidates: 2 },
    summary: {},
  }
  await writeFile(path.join(rootDir, "manifest.json"), JSON.stringify(manifest))
  return rootDir
}

void test("loads and verifies a compact v0.8.2 evaluate bundle", async (t) => {
  const rootDir = await writeFixtureBundle()
  t.after(() => rm(rootDir, { recursive: true, force: true }))

  const bundle = await loadEvaluationBundle(rootDir, {
    verification: "outputs-and-sources",
  })

  assert.match(bundle.manifestSha256, /^[a-f\d]{64}$/)
  assert.equal(bundle.verification.outputFiles.length, 4)
  assert.equal(bundle.verification.sourceFiles.length, 1)
  assert.equal(bundle.manifest.output_files[0].label, null)
  assert.equal(bundle.manifest.output_files[0].content_hash, null)
  assert.equal(bundle.evaluation.task.metric_label, null)
  assert.deepEqual(
    bundle.evaluation.targets["target-a"].candidates[0].validity.tiers["0"]
      .checks,
    []
  )
  assert.equal(
    bundle.evaluation.targets["target-a"].candidates[0].matches_acceptable,
    false
  )
  assert.equal(
    bundle.evaluation.targets["target-a"].candidates[0]
      .matched_acceptable_index,
    null
  )
  assert.equal(
    bundle.evaluation.targets["target-b"].candidates[0].validity.tiers["0"]
      .checks[0].message,
    null
  )
  assert.equal(
    bundle.analysis.metrics["solv_0[fixture-stock]_rate"].ci_low,
    null
  )
  assert.equal(
    bundle.analysis.metrics["solv_0[fixture-stock]_rate"].reliability,
    null
  )
  assert.ok("depth unknown" in bundle.analysis.by_stratum)
})

void test("canonical metric helpers preserve labels and missing evidence", () => {
  const analysis = parseAnalysisFile(createEvaluateV2Fixture().analysis)
  const solvKey = solvMetricKey(0, "n1-n5-stock")

  assert.equal(tierValidityMetricKey(0), "tier_0_validity_rate")
  assert.equal(solvKey, "solv_0[n1-n5-stock]_rate")
  assert.deepEqual(parseCanonicalMetricKey(solvKey), {
    family: "solv",
    tier: 0,
    label: "n1-n5-stock",
    statistic: "rate",
  })
  assert.equal(getTierValidityMetric(analysis, 0)?.value, 0.5)
  assert.equal(getSolvMetric(analysis, 0, "fixture-stock")?.value, 0.5)
  assert.equal(getTierValidityMetric(analysis, 1), undefined)
  assert.equal(getSolvMetric(analysis, 0, "another-stock"), undefined)
})

void test("rejects candidate route and failure ambiguity", () => {
  const fixture = createEvaluateV2Fixture()
  fixture.candidates["target-a"][0].failure = {
    code: "adapter.invalid_route",
  }
  assert.throws(
    () => parseCandidatesFile(fixture.candidates),
    /cannot contain both route and failure/
  )
})

void test("rejects rank and target mismatches", () => {
  const fixture = createEvaluateV2Fixture()
  const candidates = parseCandidatesFile(fixture.candidates)
  fixture.evaluation.targets["target-a"].candidates[0].rank = 2
  const evaluation = parseEvaluationFile(fixture.evaluation)
  assert.throws(
    () => assertCandidateAlignment(candidates, evaluation),
    /candidate and evaluation slots differ/
  )

  const secondFixture = createEvaluateV2Fixture()
  secondFixture.evaluation.targets["target-a"].target.smiles = "CCC"
  const secondCandidates = parseCandidatesFile(secondFixture.candidates)
  const secondEvaluation = parseEvaluationFile(secondFixture.evaluation)
  assert.throws(
    () => assertCandidateAlignment(secondCandidates, secondEvaluation),
    /does not match its task definition/
  )
})

void test("rejects hash-valid bundles with inconsistent candidate payloads", async (t) => {
  const rootDir = await writeFixtureBundle((fixture) => {
    fixture.evaluation.targets["target-a"].candidates[0].route.annotations = {
      adapter: "different",
    }
    return fixture
  })
  t.after(() => rm(rootDir, { recursive: true, force: true }))

  await assert.rejects(
    loadEvaluationBundle(rootDir),
    /candidate and evaluation payloads differ/
  )
})

void test("rejects output and source hash mismatches", async (t) => {
  const outputRoot = await writeFixtureBundle()
  const sourceRoot = await writeFixtureBundle()
  t.after(() => rm(outputRoot, { recursive: true, force: true }))
  t.after(() => rm(sourceRoot, { recursive: true, force: true }))

  const candidatePath = path.join(outputRoot, "candidates.json.gz")
  await writeFile(
    candidatePath,
    Buffer.concat([await readFile(candidatePath), Buffer.from("tamper")])
  )
  await assert.rejects(loadEvaluationBundle(outputRoot), /output hash mismatch/)

  await writeFile(path.join(sourceRoot, "raw-results.json"), "tamper")
  await assert.rejects(
    loadEvaluationBundle(sourceRoot, { verification: "outputs-and-sources" }),
    /source hash mismatch/
  )
})
