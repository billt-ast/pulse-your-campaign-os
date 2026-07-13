# @pulse/email-worker

**Kind:** workers
**Lovable path:** `src/workers/email-worker`
**Future workspace path:** `workers/email-worker`

Transactional email delivery. Lovable impl: Lovable Email + `/api/public/workers/email`.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `workers/email-worker/src/` and its `index.ts` becomes the package entry.
