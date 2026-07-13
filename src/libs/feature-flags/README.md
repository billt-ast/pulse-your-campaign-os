# @pulse/feature-flags

**Kind:** libs
**Lovable path:** `src/libs/feature-flags`
**Future workspace path:** `libs/feature-flags`

Flag store + evaluation primitives used by the `feature-flags` package.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `libs/feature-flags/src/` and its `index.ts` becomes the package entry.
