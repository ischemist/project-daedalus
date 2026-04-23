# overview

## what daedalus is

daedalus is an open-source, self-hostable orchestration platform for running retrosynthesis models. it accepts target molecules, dispatches planning tasks to model runtimes, collects results, and presents them through a web interface.

it is the execution layer of the ischemist ecosystem — the thing that actually runs models and manages the queue.

## what daedalus is NOT

- not a model. it doesn't contain any ML code, weights, or chemistry logic.
- not a benchmarking tool. that's procrustes (retrocast).
- not a visualization app. that's syntharena (though daedalus embeds route viewers).
- not an API service. v1 has no public API — it's a self-hosted tool.
- not a cloud platform. no billing, no multi-tenancy, no elastic scaling.

## product goals v1

1. **submit a molecule, get a retrosynthesis plan.** the core loop must work end-to-end with minimal friction.
2. **support multiple models** without daedalus knowing anything about their internals. models are black boxes behind a runtime contract.
3. **fair scheduling.** when multiple users submit work, no single user monopolizes GPU time.
4. **self-hostable with docker-compose.** one command to bring up the full stack on a lab server.
5. **ecosystem-compatible outputs.** results normalize through retrocast, persist into daedalus route topology, and can be visualized or exported with shared ischemist route packages.

## explicit non-goals

- public multi-tenant SaaS
- elastic auto-scaling (fixed worker pool is fine for v1)
- task retry logic (fail → user resubmits manually)
- S3 / cloud object storage (local filesystem)
- billing, usage metering, rate limiting
- a public REST API for programmatic access

## naming

daedalus was the master craftsman of greek myth — he built the labyrinth. project-ariadne is a retrosynthesis model named for the thread that navigates the labyrinth. daedalus builds and manages the maze of compute that ariadne's thread runs through.

the naming is deliberate: daedalus constructs the infrastructure, ariadne solves the problem inside it.

## ecosystem relationships

```
┌─────────────────────────────────────────────────────┐
│  syntharena                                         │
│  (interactive visualization, leaderboard)           │
│       ▲ exports routes for inspection               │
│       │                                             │
│  project-daedalus  ◄─────────────────────────────┐  │
│  (orchestration, queue, execution)               │  │
│       │                                          │  │
│       │ uses retrocast adapters                   │  │
│       ▼                                          │  │
│  project-procrustes (retrocast)                  │  │
│  (canonical schemas, model adapters, scoring)    │  │
│                                                  │  │
│  model repos (ariadne, retrostar, ...)           │  │
│  (contain their own runtime-* services)  ────────┘  │
└─────────────────────────────────────────────────────┘
```

- **procrustes (retrocast):** daedalus uses retrocast adapters to normalize raw model outputs into a canonical python route schema. retrocast handles planner output heterogeneity and chemical normalization; daedalus consumes the result.
- **syntharena:** daedalus and syntharena share route projection and visualization primitives so both apps can inspect route trees without duplicating topology/layout code.
- **model repos (ariadne, etc.):** each model repo contains its own `runtime-*` service implementing daedalus's runtime contract. daedalus never imports model code — it calls runtimes over HTTP or subprocess.
- **@ischemist/routes:** shared npm package for route projection primitives. it converts retrocast-compatible route trees into storage-neutral records, route/tree signatures, and visualization trees. it does not import prisma and does not perform smiles canonicalization.
- **@ischemist/route-viewer:** shared react package for route graph visualization. it consumes `@ischemist/routes` visualization trees and graph builders, then renders react flow components that daedalus and syntharena can both embed.
