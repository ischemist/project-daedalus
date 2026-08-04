# @ischemist/route-viewer

## 0.1.2

### Patch Changes

- Updated dependencies [058f746]
  - @ischemist/routes@0.2.0

## 0.1.1

### Patch Changes

- c64fa72: Show vendor and price badges for in-stock leaf molecules when buyable metadata is provided.

## 0.1.0

### Minor Changes

- f78205a: upgrade retrocast artifact support to the v0.7 schema.

  `@ischemist/routes` now reads v0.7 route trees with `product_of`, `annotations`, route-path refs, and collected `Candidate` payloads instead of legacy `routes.json` route arrays. `@ischemist/retrocast-io` now scans and loads `candidates.json.gz`, `evaluation.json.gz`, and `analysis.json.gz` artifacts with evaluation data under `targets`.

- Updated dependencies [f78205a]
  - @ischemist/routes@0.1.0

## 0.0.9

### Patch Changes

- 21c5816: add filesystem-backed retrocast artifact loading, route inspection helpers, graph metadata hooks, and controlled viewer selection for local retrocast route inspection.
- Updated dependencies [21c5816]
  - @ischemist/routes@0.0.6

## 0.0.8

### Patch Changes

- Updated dependencies [a9c32ad]
  - @ischemist/routes@0.0.5
