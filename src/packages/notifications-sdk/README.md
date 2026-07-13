# @pulse/notifications-sdk

**Kind:** packages
**Lovable path:** `src/packages/notifications-sdk`
**Future workspace path:** `packages/notifications-sdk`

Client hooks + typed event contracts for the notifications context.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/notifications-sdk/src/` and its `index.ts` becomes the package entry.
