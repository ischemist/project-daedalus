# @ischemist/routes

typescript route projection primitives for retrocast-compatible retrosynthesis routes.

this package converts a retrocast route tree into storage-neutral records and visualization trees. it does not import prisma and does not canonicalize smiles; retrocast is expected to provide already-normalized molecule identity.

the published package emits esm and ships generated type declarations. it
requires Node 22.12 or newer, allowing the same synchronous module graph to be
loaded through either `import` or Node's `require(esm)` interoperability.

## install

```sh
npm install @ischemist/routes
```

## usage

```ts
import { projectRetrocastRoute } from "@ischemist/routes/projection"
import { buildRouteGraph } from "@ischemist/routes/visualization"

const projection = projectRetrocastRoute(retrocastRoute)
const graph = buildRouteGraph(projection.visualizationTree)
```

node-only helpers for local retrocast candidate artifacts are available from the `node` subpath:

```ts
import { loadRetrocastCandidatesGzip } from "@ischemist/routes/node"
```

RetroCast candidates are represented as an exclusive union: every ranked slot
contains exactly one route or one failure record. Parsing rejects missing,
ambiguous, duplicate-rank, and malformed candidate slots.

The parsed target map has a null prototype so identifiers such as `__proto__`
remain ordinary own keys. Use `Object.hasOwn(candidatesByTarget, targetId)`;
do not call `candidatesByTarget.hasOwnProperty(targetId)`.

## exports

- `@ischemist/routes`: shared types, projection helpers, signature helpers, visualization helpers
- `@ischemist/routes/projection`: retrocast route validation and projection
- `@ischemist/routes/visualization`: layout and graph builders
- `@ischemist/routes/node`: node-only candidate json/gzip loaders
