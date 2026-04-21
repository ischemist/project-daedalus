# project-daedalus

open-source, self-hostable orchestration platform for running synthesis planning (retrosynthesis) models. daedalus is the execution layer: it takes task submissions, schedules them fairly across workers, and runs heterogeneous planning models via a dual-mode executor (cold subprocess or warm long-lived runtime). model authors focus on chemistry; daedalus handles orchestration, runtime isolation, and result delivery.

## ecosystem

```
┌─────────────────────────────────────────────────────────────────┐
│                        user / researcher                        │
└──────────┬──────────────────────┬───────────────────┬───────────┘
           │                      │                   │
           ▼                      ▼                   ▼
   ┌──────────────┐    ┌───────────────────┐   ┌────────────┐
   │   daedalus   │    │    syntharena     │   │  procrustes │
   │  orchestrate │    │  visualize routes │   │  (RetroCast)│
   │  & execute   │    │  & leaderboard   │   │  schemas,   │
   └──────┬───────┘    └────────┬──────────┘   │  adapters,  │
          │                     │              │  scoring    │
          │    ┌────────────────┘              └──────┬──────┘
          │    │                                      │
          ▼    ▼                                      ▼
   ┌──────────────┐                          ┌──────────────┐
   │   runtimes   │◄─────────────────────────│    models     │
   │  (ariadne,   │   canonical schemas &    │  (ariadne,   │
   │   retro*,    │   route representations  │   retro*,    │
   │   etc.)      │                          │   etc.)      │
   └──────────────┘                          └──────────────┘
```

daedalus orchestrates. procrustes standardizes. syntharena visualizes. model repos own their runtimes.

## repo structure

```
project-daedalus/
├── apps/
│   └── web/                  # Next.js 16 — task submission, results, admin
├── packages/
│   └── routes/               # @ischemist/routes — core/viz/react modules
├── worker/                   # Python RQ worker, dual-mode executor
├── scheduler/                # Python, long-running fairness-aware scheduler
├── docs/
│   ├── spec/                 # architecture & system spec
│   └── practices/            # development standards
├── docker-compose.yml
└── pnpm-workspace.yaml
```

four processes: **daedalus-web** (Next.js), **daedalus-scheduler** (Python), **daedalus-worker** (Python/RQ), **postgres + redis** (infra).

runtimes (e.g. runtime-ariadne) live in their respective model repos. daedalus defines the runtime contract.

## docs

- [`docs/spec/`](./docs/spec/) — architecture, system spec, runtime contract
- [`docs/practices/`](./docs/practices/) — coding standards, conventions

## license

MIT
