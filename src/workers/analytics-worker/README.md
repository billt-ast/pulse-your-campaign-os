# @pulse/analytics-worker

**Kind:** workers
**Lovable path:** `src/workers/analytics-worker`
**Future workspace path:** `workers/analytics-worker`

Rollup jobs for dashboards. Lovable impl: pg_cron nightly + `/api/public/workers/analytics`.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `workers/analytics-worker/src/` and its `index.ts` becomes the package entry.
