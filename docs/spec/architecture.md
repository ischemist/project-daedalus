# architecture

## three logical layers

| layer             | what it does                               | components                                                     |
| ----------------- | ------------------------------------------ | -------------------------------------------------------------- |
| **control plane** | accepts work, schedules it, stores state   | daedalus-web, daedalus-scheduler, postgres                     |
| **worker plane**  | picks up jobs, executes them, reports back | daedalus-worker, redis (RQ)                                    |
| **runtime plane** | actually runs the models                   | runtime-ariadne, runtime-retrostar, etc. (live in model repos) |

daedalus owns the first two layers. the runtime plane is owned by model repos — daedalus only defines the contract.

## component descriptions

### daedalus-web (next.js 16, react 19, typescript)

the user-facing application. handles task submission, queue state display, result viewing, and admin. uses prisma ORM against postgres. projects retrocast-compatible routes through `@ischemist/routes`, persists them into daedalus topology tables, and embeds visualization through `@ischemist/route-viewer`. provides callback endpoints that workers hit to report completion and heartbeats.

this is the only component users interact with directly.

### daedalus-scheduler (python, long-running process)

a continuously running loop (NOT a cron job) that polls postgres for schedulable tasks. it applies fairness policy (round-robin across users), checks capacity (per-runtime slot availability, worker health), and enqueues matched tasks to redis via RQ.

also runs reaper logic: detects stale leases (no heartbeat) and dead workers (missed heartbeats), marks their tasks as failed/expired.

the scheduler is the only component that decides WHAT runs WHEN. workers are dumb consumers.

### daedalus-worker (python, RQ consumer)

picks jobs off redis and executes them in one of two modes:

- **cold:** `subprocess.run(["uv", "run", "--directory", model_env_path, "script.py", ...])` — each model has its own `pyproject.toml` + `uv.lock`, full dependency isolation. the worker process never imports torch, rdkit, or any model code.
- **warm:** HTTP POST to a running runtime service (FastAPI) that already has model weights loaded in memory.

on completion (or failure), the worker calls back to daedalus-web with results and artifact paths.

### postgres + redis

postgres is the source of truth for all persistent state: tasks, workers, runtimes, artifacts, users. redis is the job queue backend for RQ — ephemeral by design. if redis dies, the scheduler re-enqueues pending tasks from postgres.

## why two execution modes

### why cold matters

cold execution via `uv run --directory` means adding a new model requires ZERO code in daedalus. drop a `pyproject.toml` and a script in the model repo, register the runtime, done. this is how procrustes scripts already work — proven pattern.

tradeoff: every invocation pays model-load overhead (downloading weights, initializing torch, etc.).

### why warm matters

for a model like ariadne where loading weights takes ~30 seconds but inference takes ~5 minutes, cold execution adds 10% overhead per task. for lighter models or shorter tasks, the ratio is worse.

warm runtimes keep weights in memory via a long-running FastAPI service. the worker just sends an HTTP request. model repos own their runtime implementations; daedalus only defines the contract (POST /plan).

v1 starts cold-only. warm support is added in M5.

## data flow: happy path

```
user submits "plan CC(=O)O with ariadne"
        │
        ▼
[daedalus-web] creates submission_batch + planning_task in postgres
        │                                    status: queued
        ▼
[daedalus-scheduler] polls postgres, finds task
        │ checks: ariadne runtime exists? slots available? worker healthy?
        │ applies fairness: this user has fewer running tasks than others
        │ leases task in postgres (status: leased)
        ▼
[redis/RQ] job enqueued with payload
        │
        ▼
[daedalus-worker] dequeues job
        │ updates task status: running (via callback)
        │ executes: subprocess.run(["uv", "run", ...]) or POST /plan
        │ waits for completion
        │ saves artifacts to local filesystem
        ▼
[daedalus-worker] calls POST /api/callbacks/task-complete
        │ payload: status, runtime_seconds, artifact paths
        ▼
[daedalus-web] updates task in postgres (status: succeeded)
        │ retrocast adapter normalizes raw output → canonical python routes
        │ @ischemist/routes projects route topology for storage + visualization
        ▼
user views results with route tree visualization
```

## network topology

```
┌──────────┐     ┌──────────────┐     ┌───────────┐
│ browser  │────▶│ daedalus-web │────▶│ postgres  │◀──── daedalus-scheduler
└──────────┘     │  (next.js)   │     └───────────┘           │
                 │              │                              │
                 │  callbacks ◀─┼──── daedalus-worker          ▼
                 └──────────────┘         │              ┌─────────┐
                                          │◀─────────────│  redis  │
                                          │              └─────────┘
                                          ▼
                                    ┌────────────┐
                                    │  runtime-* │
                                    │  (model    │
                                    │   repos)   │
                                    └────────────┘
```

## deployment model

v1 uses docker-compose. all four processes + postgres + redis in one compose file. suitable for a single lab server with one or more GPUs.

```yaml
# conceptual — not the real file
services:
  web: # next.js app, port 3000
  scheduler: # python loop
  worker: # python RQ consumer (scale with --replicas or multiple services)
  postgres: # persistent volume
  redis: # ephemeral
```

workers that need GPU access get `deploy.resources.reservations.devices` in compose.

## monorepo structure

```
project-daedalus/
├── apps/web/                 # next.js 16 app (daedalus-web)
│   ├── prisma/               # schema + migrations
│   └── src/
├── packages/routes/          # @ischemist/routes: route projection primitives
│   └── src/                  # retrocast types, signatures, records, graph builders
├── packages/route-viewer/    # @ischemist/route-viewer
│   └── src/                  # react flow components, molecule rendering
├── worker/                   # python: daedalus-worker
├── scheduler/                # python: daedalus-scheduler
├── docs/
│   ├── spec/                 # these documents
│   └── practices/            # development practices
├── docker-compose.yml
└── pnpm-workspace.yaml
```

the typescript side is a pnpm monorepo. the python side (worker + scheduler) is managed with uv. they share postgres as the integration point and redis as the queue.
