# @pulse/utils

**Kind:** packages
**Lovable path:** `src/packages/utils`
**Future workspace path:** `packages/utils`

Pure helpers (formatters, guards, invariants). No React, no I/O.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/utils/src/` and its `index.ts` becomes the package entry.
