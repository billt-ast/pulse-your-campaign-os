# @pulse/validators

**Kind:** packages
**Lovable path:** `src/packages/validators`
**Future workspace path:** `packages/validators`

Shared zod schemas reused by server fns and forms.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/validators/src/` and its `index.ts` becomes the package entry.
