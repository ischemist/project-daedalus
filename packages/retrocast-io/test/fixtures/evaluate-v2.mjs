const targetA = {
  id: "target-a",
  smiles: "CCO",
  inchikey: "LFQSCWFLJHTTHZ-UHFFFAOYSA-N",
  acceptable_routes: [],
  annotations: {},
}

const targetB = {
  id: "target-b",
  smiles: "CCN",
  inchikey: "QUSNBJAOOMFDIB-UHFFFAOYSA-N",
  acceptable_routes: [],
  annotations: {},
}

const route = {
  target: {
    smiles: targetA.smiles,
    inchikey: targetA.inchikey,
    annotations: {},
  },
  annotations: { adapter: "fixture" },
  schema_version: "2",
}

targetA.acceptable_routes = [route]

const failure = {
  code: "adapter.invalid_route",
  target_id: targetB.id,
  target_smiles: targetB.smiles,
  target_inchikey: targetB.inchikey,
}

const constraint = {
  kind: "retrocast.stock_termination",
  stock: "fixture-stock",
}

const task = {
  name: "fixture-benchmark",
  description: "Compact RetroCast v0.8.2 evaluation fixture.",
  targets: { "target-a": targetA, "target-b": targetB },
  default_constraints: [constraint],
  constraints: {},
  annotations: {},
  schema_version: "2",
}

export function createEvaluateV2Fixture() {
  const candidates = {
    "target-a": [{ rank: 1, route }],
    "target-b": [{ rank: 1, failure }],
  }
  const evaluation = {
    task,
    tiers: [0],
    metric_label: "fixture-stock",
    acceptable_match_level: "full",
    acceptable_route_match: "prefix",
    targets: {
      "target-a": {
        target: targetA,
        effective_constraints: [constraint],
        candidates: [
          {
            rank: 1,
            route,
            validity: { tiers: { 0: { status: "pass" } }, reactions: [] },
            constraints: { status: "pass" },
          },
        ],
      },
      "target-b": {
        target: targetB,
        effective_constraints: [constraint],
        candidates: [
          {
            rank: 1,
            failure,
            validity: {
              tiers: {
                0: {
                  status: "fail",
                  checks: [{ code: failure.code, status: "fail" }],
                },
              },
              reactions: [],
            },
            constraints: { status: "not_evaluated" },
          },
        ],
      },
    },
    schema_version: "2",
  }
  const analysis = {
    schema_version: "2",
    metrics: {
      tier_0_validity_rate: {
        value: 0.5,
        count: 2,
        ci_low: 0,
        ci_high: 1,
        reliability: { code: "LOW_N", message: "Small fixture." },
      },
      tier_0_validity_mrr: { value: 0.5, count: 2 },
      "solv_0[fixture-stock]_rate": { value: 0.5, count: 2 },
      "solv_0[fixture-stock]_mrr": { value: 0.5, count: 2 },
    },
    by_stratum: {
      "depth 0": {
        tier_0_validity_rate: { value: 1, count: 1 },
        tier_0_validity_mrr: { value: 1, count: 1 },
        "solv_0[fixture-stock]_rate": { value: 1, count: 1 },
        "solv_0[fixture-stock]_mrr": { value: 1, count: 1 },
      },
    },
    bootstrap_resamples: 100,
    runtime: { timed_target_count: 0 },
  }

  return JSON.parse(
    JSON.stringify({
      candidates,
      evaluation,
      analysis,
      evaluationRun: {
        engine: "rust",
        workers: 2,
        targets: 2,
        candidates: 2,
        ingest_seconds: 0.1,
        score_seconds: 0.1,
        analyze_seconds: 0.1,
        total_seconds: 0.4,
        targets_per_second: 5,
        candidates_per_second: 5,
      },
    })
  )
}
