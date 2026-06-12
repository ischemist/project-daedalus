---
"@ischemist/routes": minor
"@ischemist/retrocast-io": minor
"@ischemist/route-viewer": patch
---

upgrade retrocast artifact support to the v0.7 schema.

`@ischemist/routes` now reads v0.7 route trees with `product_of`, `annotations`, route-path refs, and collected `Candidate` payloads instead of legacy `routes.json` route arrays. `@ischemist/retrocast-io` now scans and loads `candidates.json.gz`, `evaluation.json.gz`, and `analysis.json.gz` artifacts with evaluation data under `targets`.
