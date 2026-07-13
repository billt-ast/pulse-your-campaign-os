# @pulse/events

**Kind:** services
**Lovable path:** `src/services/events`
**Future workspace path:** `services/events`

Real-world events (rallies, town halls) + RSVP.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/events/src/` and its `index.ts` becomes the package entry.
