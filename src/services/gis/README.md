# @pulse/gis

**Kind:** services
**Lovable path:** `src/services/gis`
**Future workspace path:** `services/gis`

Geospatial layers, boundaries, catchments.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/gis/src/` and its `index.ts` becomes the package entry.
