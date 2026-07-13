# @pulse/ui

**Kind:** packages
**Lovable path:** `src/packages/ui`
**Future workspace path:** `packages/ui`

Low-level shadcn/ui primitives (Button, Input, Dialog, Drawer, ...). Sourced from `src/components/ui/*`.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/ui/src/` and its `index.ts` becomes the package entry.
