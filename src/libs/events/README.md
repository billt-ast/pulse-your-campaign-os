# @pulse/events

**Kind:** libs
**Lovable path:** `src/libs/events`
**Future workspace path:** `libs/events`

Domain-event contracts + emit/consume helpers. Postgres LISTEN/NOTIFY + outbox pattern.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `libs/events/src/` and its `index.ts` becomes the package entry.
