# @pulse/analytics

**Kind:** services
**Lovable path:** `src/services/analytics`
**Future workspace path:** `services/analytics`

Metric definitions, dashboards, exports.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/analytics/src/` and its `index.ts` becomes the package entry.
