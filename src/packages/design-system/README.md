# @pulse/design-system

**Kind:** packages
**Lovable path:** `src/packages/design-system`
**Future workspace path:** `packages/design-system`

Composite design primitives that wrap `ui` + `theme` (AppShell, PanelFrame, StatCard). Re-exports the existing `src/components/pulse/*` today.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/design-system/src/` and its `index.ts` becomes the package entry.
