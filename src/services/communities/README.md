# @pulse/communities

**Kind:** services
**Lovable path:** `src/services/communities`
**Future workspace path:** `services/communities`

Constituent communities, catchments, stakeholder groups.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/communities/src/` and its `index.ts` becomes the package entry.
