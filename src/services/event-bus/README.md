# @pulse/event-bus

**Kind:** services
**Lovable path:** `src/services/event-bus`
**Future workspace path:** `services/event-bus`

Domain event publication, subscriptions, queues and dead letters.

## Kernel home
Primary kernel: **event** (`src/kernel/contracts/event.ts`).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/event-bus/src/` and its `index.ts` becomes the package entry.
