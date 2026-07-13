# @pulse/icons

**Kind:** packages
**Lovable path:** `src/packages/icons`
**Future workspace path:** `packages/icons`

Lucide re-exports + brand marks. One import surface for every icon used across the app.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/icons/src/` and its `index.ts` becomes the package entry.
