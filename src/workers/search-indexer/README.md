# @pulse/search-indexer

**Kind:** workers
**Lovable path:** `src/workers/search-indexer`
**Future workspace path:** `workers/search-indexer`

Maintains the universal search index. Lovable impl: Postgres tsvector triggers + `/api/public/workers/search`.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `workers/search-indexer/src/` and its `index.ts` becomes the package entry.
