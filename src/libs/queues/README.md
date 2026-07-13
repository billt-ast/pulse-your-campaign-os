# @pulse/queues

**Kind:** libs
**Lovable path:** `src/libs/queues`
**Future workspace path:** `libs/queues`

Queue abstraction. Lovable impl: Postgres-backed job table + pg_cron drainer.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `libs/queues/src/` and its `index.ts` becomes the package entry.
