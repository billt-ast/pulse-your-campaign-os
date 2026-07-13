# @pulse/cleanup-worker

**Kind:** workers
**Lovable path:** `src/workers/cleanup-worker`
**Future workspace path:** `workers/cleanup-worker`

Soft-delete purges, orphan sweeps. Lovable impl: pg_cron.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `workers/cleanup-worker/src/` and its `index.ts` becomes the package entry.
