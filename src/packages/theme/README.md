# @pulse/theme

**Kind:** packages
**Lovable path:** `src/packages/theme`
**Future workspace path:** `packages/theme`

CSS custom properties, semantic tokens, motion constants. Consumed via `src/styles.css` @theme block.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/theme/src/` and its `index.ts` becomes the package entry.
