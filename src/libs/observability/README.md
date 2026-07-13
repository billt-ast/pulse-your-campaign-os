# @pulse/observability

**Kind:** libs
**Lovable path:** `src/libs/observability`
**Future workspace path:** `libs/observability`

Trace + metric emitters. Wraps `console.*` today, ready for OpenTelemetry.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `libs/observability/src/` and its `index.ts` becomes the package entry.
