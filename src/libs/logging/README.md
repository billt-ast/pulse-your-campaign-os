# @pulse/logging

**Kind:** libs
**Lovable path:** `src/libs/logging`
**Future workspace path:** `libs/logging`

Structured logger (level, correlation id, tenant id).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `libs/logging/src/` and its `index.ts` becomes the package entry.
