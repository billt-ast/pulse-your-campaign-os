# @pulse/gis-processor

**Kind:** workers
**Lovable path:** `src/workers/gis-processor`
**Future workspace path:** `workers/gis-processor`

Geometry validation, tiling, catchment enrichment. Lovable impl: `/api/public/workers/gis`.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `workers/gis-processor/src/` and its `index.ts` becomes the package entry.
