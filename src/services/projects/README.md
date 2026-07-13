# @pulse/projects

**Kind:** services
**Lovable path:** `src/services/projects`
**Future workspace path:** `services/projects`

Project delivery + linkage to campaigns.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/projects/src/` and its `index.ts` becomes the package entry.
