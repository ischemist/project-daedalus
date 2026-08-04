# @ischemist/retrocast-io

node-only loaders for retrocast artifact bundles. this package requires Node
22.12 or newer and reads filesystem-backed retrocast exports without assuming
prisma, react, or an import step. its synchronous ESM graph supports both
`import` and Node's `require(esm)` interoperability.

```ts
import {
  listRunDescriptors,
  loadCheckpointBundle,
} from "@ischemist/retrocast-io"

const [run] = await listRunDescriptors("/path/to/project-ariadne")
const bundle = await loadCheckpointBundle(run)
```

supported artifacts:

- benchmark definitions under `data/retrocast/1-benchmarks/definitions`
- processed `candidates.json(.gz)`
- scored `evaluation.json(.gz)`
- result `analysis.json(.gz)`
- `manifest.json`
- optional `ariadne_metadata.json`

## verified evaluation bundles

RetroCast `evaluate:v2` output directories from versions `>=0.8.2,<0.9` are
the preferred import boundary. The bundle loader realpath-confines every
regular output file to the bundle root and verifies every manifest-tracked
hash before parsing. It then checks task targets, effective constraint
overrides, the derived Solv label, candidate slots and payloads, aggregate
check statuses, manifest/run counts, and canonical Tier/Solv rate and MRR.

```ts
import {
  getSolvMetric,
  getTierValidityMetric,
  loadEvaluationBundle,
} from "@ischemist/retrocast-io"

const bundle = await loadEvaluationBundle("/path/to/evaluate-output", {
  verification: "outputs-and-sources",
})

const tierZero = getTierValidityMetric(bundle.analysis, 0)
const solvZero = getSolvMetric(
  bundle.analysis,
  0,
  bundle.evaluation.metric_label
)
```

Database importers should avoid retaining the standalone candidate tree and
the scored evaluation tree at the same time:

```ts
import {
  loadEvaluationBundleForImport,
  type VerifiedEvaluationBundleForImport,
} from "@ischemist/retrocast-io"

const bundle: VerifiedEvaluationBundleForImport =
  await loadEvaluationBundleForImport("/path/to/evaluate-output")

// evaluation is the one canonical candidate source for persistence.
for (const [targetId, target] of Object.entries(bundle.evaluation.targets)) {
  await importTarget(targetId, target.candidates)
}
```

The import loader streams `candidates.json.gz` one target at a time into
canonical digests, releases each raw target, and then aligns those digests
with `evaluation.json.gz`. Its result intentionally has no
`candidatesByTarget` field. A single streamed target value is capped at 64 MiB
of JSON characters to stop malformed gzip input from growing without bound.
The largest target across the 84-bundle v0.8.2 migration corpus is 1,494,049
characters, leaving 44.9x headroom. The canonical evaluation tree is still
retained, so this is a lower-peak-memory import path rather than a fully
bounded-memory loader.

Target-keyed maps are returned as null-prototype records so identifiers such
as `__proto__` and `constructor` remain ordinary own keys. Use `Object.hasOwn`
when testing membership.

`outputs` is the portable default because source paths may refer to the
producer machine. Database rebuilds should use `outputs-and-sources`. The
returned bundle includes the raw manifest SHA256 plus the exact output and
source paths that were verified.

Absolute source paths are intentionally not confined to the bundle root so a
producer can reference its original planner outputs. Treat them as trusted
manifest capabilities: use `outputs-and-sources` only for manifests from a
trusted producer, and use the portable `outputs` policy for untrusted or moved
bundles.

Metric helpers preserve canonical RetroCast keys and exact task labels. A
missing metric returns `undefined`; it is never converted to zero. Optional
fields omitted by v0.8.2 serialization are normalized to explicit `null`,
empty checks, or their typed producer default. Later 0.8.x RouteValidity
assessment fields are optional, minimally shape-validated, and preserved with
unknown extensions intact.

Tier/Solv metrics are independently recomputed globally and for depth strata
whose membership follows RetroCast's public evaluation semantics. Other
analysis metrics and arbitrary future stratum labels are parsed and preserved,
but are not claimed as independently reproduced by this package.
