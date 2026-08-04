# @ischemist/retrocast-io

## 0.2.0

### Minor Changes

- 058f746: Add a strict RetroCast `>=0.8.2,<0.9` evaluation-bundle boundary with symlink-safe manifest hash verification, typed Tier and task evaluation results, canonical Tier/Solv metric helpers, and deep cross-artifact consistency checks.

  Represent candidate slots as an exclusive route-or-failure union and reject malformed or duplicate-ranked candidate artifacts.

  Add a lower-peak-memory database import loader that streams standalone candidates for alignment and returns the scored evaluation as the single canonical candidate tree.

  Cap malformed streamed target buffers with 44.9x headroom over the largest target in the 84-bundle migration corpus.

  Bind every parsed artifact and streamed candidate digest to the exact verified bytes, and mirror RetroCast's assessment-aware Tier validity semantics.

  Declare Node 22.12 as the runtime floor and verify that the emitted synchronous ESM packages load through both `import` and `require`.

### Patch Changes

- Updated dependencies [058f746]
  - @ischemist/routes@0.2.0

## 0.1.0

### Minor Changes

- f78205a: upgrade retrocast artifact support to the v0.7 schema.

  `@ischemist/routes` now reads v0.7 route trees with `product_of`, `annotations`, route-path refs, and collected `Candidate` payloads instead of legacy `routes.json` route arrays. `@ischemist/retrocast-io` now scans and loads `candidates.json.gz`, `evaluation.json.gz`, and `analysis.json.gz` artifacts with evaluation data under `targets`.

### Patch Changes

- Updated dependencies [f78205a]
  - @ischemist/routes@0.1.0

## 0.0.1

### Patch Changes

- 21c5816: add filesystem-backed retrocast artifact loading, route inspection helpers, graph metadata hooks, and controlled viewer selection for local retrocast route inspection.
- Updated dependencies [21c5816]
  - @ischemist/routes@0.0.6
