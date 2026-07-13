# @pulse/notification-worker

**Kind:** workers
**Lovable path:** `src/workers/notification-worker`
**Future workspace path:** `workers/notification-worker`

Materializes notifications per user preference. Lovable impl: pg_cron trigger to `/api/public/workers/notifications`.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `workers/notification-worker/src/` and its `index.ts` becomes the package entry.
