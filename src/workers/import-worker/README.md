# @pulse/import-worker

**Kind:** workers
**Lovable path:** `src/workers/import-worker`
**Future workspace path:** `workers/import-worker`

Bulk data imports (CSV, JSON). Lovable impl: signed URL upload + `/api/public/workers/import`.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `workers/import-worker/src/` and its `index.ts` becomes the package entry.
