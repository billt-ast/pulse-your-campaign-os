# @pulse/tables

**Kind:** packages
**Lovable path:** `src/packages/tables`
**Future workspace path:** `packages/tables`

Data table primitives (headless, virtualized-ready).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/tables/src/` and its `index.ts` becomes the package entry.
