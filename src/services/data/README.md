# @pulse/data

**Kind:** services
**Lovable path:** `src/services/data`
**Future workspace path:** `services/data`

Platform data access contracts: query specs, cursors, cache keys.

## Kernel home
Primary kernel: **data** (`src/kernel/contracts/data.ts`).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/data/src/` and its `index.ts` becomes the package entry.
