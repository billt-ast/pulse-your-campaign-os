# @pulse/storage

**Kind:** libs
**Lovable path:** `src/libs/storage`
**Future workspace path:** `libs/storage`

Supabase Storage wrapper with signed URL helpers.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `libs/storage/src/` and its `index.ts` becomes the package entry.
