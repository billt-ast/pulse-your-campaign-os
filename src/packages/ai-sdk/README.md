# @pulse/ai-sdk

**Kind:** packages
**Lovable path:** `src/packages/ai-sdk`
**Future workspace path:** `packages/ai-sdk`

Thin wrapper over Lovable AI Gateway (chat, embeddings, image).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/ai-sdk/src/` and its `index.ts` becomes the package entry.
