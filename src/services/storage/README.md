# @pulse/storage

**Kind:** services
**Lovable path:** `src/services/storage`
**Future workspace path:** `services/storage`

Object storage uploads, signed URLs and versions.

## Kernel home
Primary kernel: **storage** (`src/kernel/contracts/storage.ts`).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/storage/src/` and its `index.ts` becomes the package entry.
