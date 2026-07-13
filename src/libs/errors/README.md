# @pulse/errors

**Kind:** libs
**Lovable path:** `src/libs/errors`
**Future workspace path:** `libs/errors`

Typed error taxonomy (DomainError, AuthError, ValidationError).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `libs/errors/src/` and its `index.ts` becomes the package entry.
