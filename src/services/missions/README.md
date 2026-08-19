# @pulse/missions

**Kind:** services
**Lovable path:** `src/services/missions`
**Future workspace path:** `services/missions`

Missions, phases, objectives and tasks — the Mission Kernel surface.

## Kernel home
Primary kernel: **mission** (`src/kernel/contracts/mission.ts`).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/missions/src/` and its `index.ts` becomes the package entry.
