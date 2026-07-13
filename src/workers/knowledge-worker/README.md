# @pulse/knowledge-worker

**Kind:** workers
**Lovable path:** `src/workers/knowledge-worker`
**Future workspace path:** `workers/knowledge-worker`

Embeds knowledge docs for retrieval. Lovable impl: `/api/public/workers/knowledge` + Lovable AI embeddings.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `workers/knowledge-worker/src/` and its `index.ts` becomes the package entry.
