# @pulse/design

**Kind:** services
**Lovable path:** `src/services/design`
**Future workspace path:** `services/design`

Design token, theme and accessibility contracts.

## Kernel home
Primary kernel: **design** (`src/kernel/contracts/design.ts`).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/design/src/` and its `index.ts` becomes the package entry.
