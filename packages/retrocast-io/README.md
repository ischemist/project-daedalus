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
- processed `routes.json(.gz)`
- scored `evaluation.json(.gz)`
- result `statistics.json(.gz)`
- `manifest.json`
- optional `ariadne_metadata.json`
