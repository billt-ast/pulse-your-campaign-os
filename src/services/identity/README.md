# @pulse/identity

**Kind:** services
**Lovable path:** `src/services/identity`
**Future workspace path:** `services/identity`

People, contacts, cohorts. Server fns + zod contracts for the Identity bounded context.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/identity/src/` and its `index.ts` becomes the package entry.
