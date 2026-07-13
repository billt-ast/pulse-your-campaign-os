# @pulse/auth

**Kind:** packages
**Lovable path:** `src/packages/auth`
**Future workspace path:** `packages/auth`

Client-side auth helpers: session hook, sign-in/out actions, role guards.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/auth/src/` and its `index.ts` becomes the package entry.
