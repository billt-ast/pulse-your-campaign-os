# @pulse/feature-flags

**Kind:** packages
**Lovable path:** `src/packages/feature-flags`
**Future workspace path:** `packages/feature-flags`

Flag resolution (server fn + client hook).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/feature-flags/src/` and its `index.ts` becomes the package entry.
