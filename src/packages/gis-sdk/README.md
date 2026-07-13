# @pulse/gis-sdk

**Kind:** packages
**Lovable path:** `src/packages/gis-sdk`
**Future workspace path:** `packages/gis-sdk`

Geospatial helpers (SRID, bbox, geometry types) shared by GIS domain.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/gis-sdk/src/` and its `index.ts` becomes the package entry.
