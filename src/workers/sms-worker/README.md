# @pulse/sms-worker

**Kind:** workers
**Lovable path:** `src/workers/sms-worker`
**Future workspace path:** `workers/sms-worker`

SMS fan-out. Lovable impl: `/api/public/workers/sms`, provider secret via add_secret.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `workers/sms-worker/src/` and its `index.ts` becomes the package entry.
