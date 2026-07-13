# @pulse/event-worker

**Kind:** workers
**Lovable path:** `src/workers/event-worker`
**Future workspace path:** `workers/event-worker`

Consumes domain events from Postgres NOTIFY / outbox and dispatches to consumers. Lovable impl: pg_net + `/api/public/workers/event`.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `workers/event-worker/src/` and its `index.ts` becomes the package entry.
