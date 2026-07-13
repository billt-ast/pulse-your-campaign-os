# @pulse/types

**Kind:** packages
**Lovable path:** `src/packages/types`
**Future workspace path:** `packages/types`

Cross-cutting TypeScript types: brand types, IDs, discriminated unions.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/types/src/` and its `index.ts` becomes the package entry.
