# @pulse/navigation

**Kind:** packages
**Lovable path:** `src/packages/navigation`
**Future workspace path:** `packages/navigation`

Sidebar, Topbar, Command Palette shells consumed by AppShell.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/navigation/src/` and its `index.ts` becomes the package entry.
