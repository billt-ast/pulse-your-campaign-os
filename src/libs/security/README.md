# @pulse/security

**Kind:** libs
**Lovable path:** `src/libs/security`
**Future workspace path:** `libs/security`

Signature verification, CSRF helpers, timing-safe compare.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `libs/security/src/` and its `index.ts` becomes the package entry.
