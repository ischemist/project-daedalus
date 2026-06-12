# @ischemist/routes

## 0.1.0

### Minor Changes

- f78205a: upgrade retrocast artifact support to the v0.7 schema.

  `@ischemist/routes` now reads v0.7 route trees with `product_of`, `annotations`, route-path refs, and collected `Candidate` payloads instead of legacy `routes.json` route arrays. `@ischemist/retrocast-io` now scans and loads `candidates.json.gz`, `evaluation.json.gz`, and `analysis.json.gz` artifacts with evaluation data under `targets`.

## 0.0.6

### Patch Changes

- 21c5816: add filesystem-backed retrocast artifact loading, route inspection helpers, graph metadata hooks, and controlled viewer selection for local retrocast route inspection.

## 0.0.5

### Patch Changes

- a9c32ad: document the esm-only package output.
