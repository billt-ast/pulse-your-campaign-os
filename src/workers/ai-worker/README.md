# @pulse/ai-worker

**Kind:** workers
**Lovable path:** `src/workers/ai-worker`
**Future workspace path:** `workers/ai-worker`

Long-running AI briefings + agent runs. Lovable impl: `/api/public/workers/ai` streamed via server route.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `workers/ai-worker/src/` and its `index.ts` becomes the package entry.
