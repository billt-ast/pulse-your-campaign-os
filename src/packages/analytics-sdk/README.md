# @pulse/analytics-sdk

**Kind:** packages
**Lovable path:** `src/packages/analytics-sdk`
**Future workspace path:** `packages/analytics-sdk`

Client + server hooks for emitting analytics events.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/analytics-sdk/src/` and its `index.ts` becomes the package entry.
