# @pulse/animations

**Kind:** packages
**Lovable path:** `src/packages/animations`
**Future workspace path:** `packages/animations`

Framer Motion presets: `motion.ease.entrance`, reveal variants, page transitions.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/animations/src/` and its `index.ts` becomes the package entry.
