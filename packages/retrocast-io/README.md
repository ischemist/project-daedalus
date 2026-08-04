# @ischemist/retrocast-io

node-only loaders for retrocast artifact bundles. this package reads filesystem-backed retrocast exports without assuming prisma, react, or an import step.

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

RetroCast v0.8.2 `evaluate:v2` output directories are the preferred import
boundary. The bundle loader verifies every manifest-tracked output before it
parses anything, then checks that candidate slots, evaluation payloads, task
targets, and target-level Tier/Solv rates agree.

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

`outputs` is the portable default because source paths may refer to the
producer machine. Database rebuilds should use `outputs-and-sources`. The
returned bundle includes the raw manifest SHA256 plus the exact output and
source paths that were verified.

Metric helpers preserve canonical RetroCast keys and exact task labels. A
missing metric returns `undefined`; it is never converted to zero. Optional
fields omitted by v0.8.2 serialization are normalized to explicit `null`,
empty checks, or their typed producer default.
