# @pulse/http

**Kind:** libs
**Lovable path:** `src/libs/http`
**Future workspace path:** `libs/http`

Fetch wrappers, retry, timeout, typed error mapping.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `libs/http/src/` and its `index.ts` becomes the package entry.
