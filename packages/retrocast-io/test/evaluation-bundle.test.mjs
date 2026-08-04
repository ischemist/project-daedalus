import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { gunzipSync, gzipSync } from "node:zlib"
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import test from "node:test"

import {
  assertCandidateAlignment,
  getSolvMetric,
  getTierValidityMetric,
  loadEvaluationBundle,
  loadEvaluationBundleForImport,
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

async function writeFixtureBundle(
  transform = (fixture) => fixture,
  transformManifest = (manifest) => manifest
) {
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
  const manifest = transformManifest({
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
  })
  await writeFile(path.join(rootDir, "manifest.json"), JSON.stringify(manifest))
  return rootDir
}

async function rewriteBundleArtifact(rootDir, fileName, transform) {
  const artifactPath = path.join(rootDir, fileName)
  const compressed = fileName.endsWith(".gz")
  const content = await readFile(artifactPath)
  const value = JSON.parse(
    (compressed ? gunzipSync(content) : content).toString("utf8")
  )
  const encoded = Buffer.from(JSON.stringify(transform(value)))
  const rewritten = compressed ? gzipSync(encoded) : encoded
  await writeFile(artifactPath, rewritten)

  const manifestPath = path.join(rootDir, "manifest.json")
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"))
  const output = manifest.output_files.find(
    (file) => path.basename(file.path) === fileName
  )
  output.sha256 = sha256(rewritten)
  await writeFile(manifestPath, JSON.stringify(manifest))
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

void test("streams candidate alignment and returns evaluation as canonical", async (t) => {
  const rootDir = await writeFixtureBundle()
  t.after(() => rm(rootDir, { recursive: true, force: true }))

  const bundle = await loadEvaluationBundleForImport(rootDir)

  assert.equal(bundle.candidateTargetCount, 2)
  assert.equal(bundle.candidateCount, 2)
  assert.equal(bundle.evaluation.targets["target-a"].candidates.length, 1)
  assert.equal("candidatesByTarget" in bundle, false)
})

void test("derives effective constraint overrides and metric labels like RetroCast", () => {
  const fixture = createEvaluateV2Fixture()
  fixture.evaluation.task.default_constraints.push({
    kind: "retrocast.route_depth",
    max_depth: "short",
  })
  fixture.evaluation.task.constraints = {
    "target-a": [
      { kind: "retrocast.stock_termination", stock: "target-stock" },
    ],
  }
  fixture.evaluation.metric_label = "fixture-stock+depth"
  fixture.evaluation.targets["target-a"].effective_constraints = [
    { kind: "retrocast.route_depth", max_depth: "short" },
    { kind: "retrocast.stock_termination", stock: "target-stock" },
  ]
  fixture.evaluation.targets["target-b"].effective_constraints = [
    { kind: "retrocast.route_depth", max_depth: "short" },
    { kind: "retrocast.stock_termination", stock: "fixture-stock" },
  ]

  const parsed = parseEvaluationFile(fixture.evaluation)
  assert.equal(parsed.metric_label, "fixture-stock+depth")

  fixture.evaluation.targets["target-a"].effective_constraints.reverse()
  assert.throws(
    () => parseEvaluationFile(fixture.evaluation),
    /effective_constraints does not match task overrides/
  )
})

void test("preserves forward-compatible RouteValidity assessments and extensions", () => {
  const fixture = createEvaluateV2Fixture()
  const validity = fixture.evaluation.targets["target-a"].candidates[0].validity
  const obligation = {
    claim: { tier: 1, obligation: "graph_rewrite_integrity" },
    evaluation: { state: "complete", verdict: "proven" },
    receipts: [{ evidence_id: "evidence-1" }],
    extension: { preserved: true },
  }
  validity.reaction_assessments = [
    {
      reaction_id: "rc:r:/",
      semantics_id: "semantics-v1",
      identities: { rewrite: { state: "established" } },
      coverage: { state: "complete" },
      obligations: [obligation],
      closest_reference: null,
      extension: "kept",
    },
  ]
  validity.molecule_assessments = [obligation]
  validity.route_assessments = [obligation]
  validity.assessment_route_binding = {
    profile_id: "retrocast.route-assessment-binding.full-json-ordered/v1",
    sha256: "a".repeat(64),
    extension: 1,
  }
  validity.future_field = { opaque: [1, 2, 3] }

  const parsed = parseEvaluationFile(fixture.evaluation)
  const parsedValidity = parsed.targets["target-a"].candidates[0].validity
  assert.deepEqual(
    parsedValidity.reaction_assessments,
    validity.reaction_assessments
  )
  assert.deepEqual(
    parsedValidity.molecule_assessments?.[0],
    validity.molecule_assessments[0]
  )
  assert.deepEqual(
    parsedValidity.route_assessments?.[0],
    validity.route_assessments[0]
  )
  assert.deepEqual(
    parsedValidity.assessment_route_binding,
    validity.assessment_route_binding
  )
  assert.deepEqual(parsedValidity.future_field, validity.future_field)

  validity.reaction_assessments[0].obligations[0].receipts = "invalid"
  assert.throws(
    () => parseEvaluationFile(fixture.evaluation),
    /receipts must be an array/
  )
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
  assert.throws(
    () => parseEvaluationFile(secondFixture.evaluation),
    /route target does not match the enclosing target/
  )
})

void test("rejects mismatched failure target provenance", () => {
  const fixture = createEvaluateV2Fixture()
  fixture.evaluation.targets["target-b"].candidates[0].failure.target_id =
    "target-a"
  assert.throws(
    () => parseEvaluationFile(fixture.evaluation),
    /failure target_id does not match the enclosing target/
  )
})

void test("rejects aggregate statuses that disagree with checks", () => {
  const tierFixture = createEvaluateV2Fixture()
  tierFixture.evaluation.targets[
    "target-b"
  ].candidates[0].validity.tiers[0].status = "pass"
  assert.throws(
    () => parseEvaluationFile(tierFixture.evaluation),
    /status does not agree with its checks/
  )

  const constraintFixture = createEvaluateV2Fixture()
  constraintFixture.evaluation.targets["target-a"].candidates[0].constraints = {
    status: "pass",
    checks: [{ code: "constraint.failed", status: "fail" }],
  }
  assert.throws(
    () => parseEvaluationFile(constraintFixture.evaluation),
    /status does not agree with its checks/
  )

  const unevaluatedRouteFixture = createEvaluateV2Fixture()
  unevaluatedRouteFixture.evaluation.targets[
    "target-a"
  ].candidates[0].constraints = { status: "not_evaluated" }
  assert.throws(
    () => parseEvaluationFile(unevaluatedRouteFixture.evaluation),
    /route candidate constraints must be evaluated/
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
  await assert.rejects(
    loadEvaluationBundleForImport(rootDir),
    /candidate and evaluation payloads differ/
  )
})

void test("rejects unsupported versions and inconsistent run counts", async (t) => {
  const versionRoot = await writeFixtureBundle(
    (fixture) => fixture,
    (manifest) => ({ ...manifest, retrocast_version: "0.8.1" })
  )
  const countRoot = await writeFixtureBundle(
    (fixture) => fixture,
    (manifest) => ({
      ...manifest,
      statistics: { ...manifest.statistics, candidates: 999 },
    })
  )
  t.after(() => rm(versionRoot, { recursive: true, force: true }))
  t.after(() => rm(countRoot, { recursive: true, force: true }))

  await assert.rejects(
    loadEvaluationBundle(versionRoot),
    /expected >=0.8.2,<0.9/
  )
  await assert.rejects(
    loadEvaluationBundle(countRoot),
    /manifest statistics.candidates 999 does not match/
  )

  const runRoot = await writeFixtureBundle()
  t.after(() => rm(runRoot, { recursive: true, force: true }))
  await rewriteBundleArtifact(runRoot, "evaluation-run.json", (run) => ({
    ...run,
    targets: 999,
  }))
  await assert.rejects(
    loadEvaluationBundle(runRoot),
    /evaluation-run targets 999 does not match/
  )
})

void test("rejects canonical MRR and derived-stratum mismatches", async (t) => {
  const mrrRoot = await writeFixtureBundle((fixture) => {
    fixture.analysis.metrics.tier_0_validity_mrr.value = 0.25
    return fixture
  })
  const stratumRoot = await writeFixtureBundle((fixture) => {
    fixture.evaluation.task.targets["target-a"].acceptable_routes = [
      fixture.candidates["target-a"][0].route,
    ]
    fixture.evaluation.targets["target-a"].target.acceptable_routes = [
      fixture.candidates["target-a"][0].route,
    ]
    return fixture
  })
  t.after(() => rm(mrrRoot, { recursive: true, force: true }))
  t.after(() => rm(stratumRoot, { recursive: true, force: true }))

  await assert.rejects(
    loadEvaluationBundle(mrrRoot),
    /tier_0_validity_mrr value 0.25 does not match/
  )
  await assert.rejects(
    loadEvaluationBundle(stratumRoot),
    /missing derived stratum depth 0/
  )
})

void test("rejects output symlink escapes and non-files", async (t) => {
  const escapeRoot = await writeFixtureBundle()
  const outsideRoot = await mkdtemp(
    path.join(tmpdir(), "retrocast-io-outside-")
  )
  t.after(() => rm(escapeRoot, { recursive: true, force: true }))
  t.after(() => rm(outsideRoot, { recursive: true, force: true }))

  const candidatePath = path.join(escapeRoot, "candidates.json.gz")
  const outsidePath = path.join(outsideRoot, "candidates.json.gz")
  await writeFile(outsidePath, await readFile(candidatePath))
  await rm(candidatePath)
  await symlink(outsidePath, candidatePath)
  await assert.rejects(
    loadEvaluationBundle(escapeRoot),
    /output resolves outside its root/
  )

  const directoryRoot = await writeFixtureBundle()
  t.after(() => rm(directoryRoot, { recursive: true, force: true }))
  const evaluationRunPath = path.join(directoryRoot, "evaluation-run.json")
  await rm(evaluationRunPath)
  await mkdir(evaluationRunPath)
  await assert.rejects(
    loadEvaluationBundle(directoryRoot),
    /must be a regular file/
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
