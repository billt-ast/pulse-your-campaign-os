# @pulse/cache

**Kind:** libs
**Lovable path:** `src/libs/cache`
**Future workspace path:** `libs/cache`

In-request + Postgres-backed cache adapters.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `libs/cache/src/` and its `index.ts` becomes the package entry.
