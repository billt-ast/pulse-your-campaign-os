# @pulse/scheduler

**Kind:** workers
**Lovable path:** `src/workers/scheduler`
**Future workspace path:** `workers/scheduler`

Cron entry point that dispatches to the workers above. Lovable impl: pg_cron rows managed via migration.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `workers/scheduler/src/` and its `index.ts` becomes the package entry.
