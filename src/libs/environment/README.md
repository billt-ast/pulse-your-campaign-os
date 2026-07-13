# @pulse/environment

**Kind:** libs
**Lovable path:** `src/libs/environment`
**Future workspace path:** `libs/environment`

Zod-validated env schemas (client + server) consumed by `packages/config`.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `libs/environment/src/` and its `index.ts` becomes the package entry.
