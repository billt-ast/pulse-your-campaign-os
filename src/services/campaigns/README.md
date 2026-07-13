# @pulse/campaigns

**Kind:** services
**Lovable path:** `src/services/campaigns`
**Future workspace path:** `services/campaigns`

Campaign lifecycle, milestones, field operations.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/campaigns/src/` and its `index.ts` becomes the package entry.
