# @pulse/context

**Kind:** services
**Lovable path:** `src/services/context`
**Future workspace path:** `services/context`

Runtime context resolution: org, workspace, mission, geography, locale.

## Kernel home
Primary kernel: **context** (`src/kernel/contracts/context.ts`).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/context/src/` and its `index.ts` becomes the package entry.
