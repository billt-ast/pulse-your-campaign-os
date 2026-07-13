# @pulse/communications

**Kind:** services
**Lovable path:** `src/services/communications`
**Future workspace path:** `services/communications`

Outbound message orchestration (email, SMS, push).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/communications/src/` and its `index.ts` becomes the package entry.
