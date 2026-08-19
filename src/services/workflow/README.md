# @pulse/workflow

**Kind:** services
**Lovable path:** `src/services/workflow`
**Future workspace path:** `services/workflow`

Workflow definitions, approvals, escalations and scheduling.

## Kernel home
Primary kernel: **workflow** (`src/kernel/contracts/workflow.ts`).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/workflow/src/` and its `index.ts` becomes the package entry.
