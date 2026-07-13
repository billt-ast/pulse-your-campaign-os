# @pulse/telemetry

**Kind:** packages
**Lovable path:** `src/packages/telemetry`
**Future workspace path:** `packages/telemetry`

Structured logging + trace helpers shared by client and server.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/telemetry/src/` and its `index.ts` becomes the package entry.
