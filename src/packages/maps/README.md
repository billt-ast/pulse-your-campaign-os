# @pulse/maps

**Kind:** packages
**Lovable path:** `src/packages/maps`
**Future workspace path:** `packages/maps`

Map surface abstraction (MapFrame today; Mapbox/MapLibre adapter later).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/maps/src/` and its `index.ts` becomes the package entry.
