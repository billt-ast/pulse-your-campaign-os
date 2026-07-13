# @pulse/database

**Kind:** libs
**Lovable path:** `src/libs/database`
**Future workspace path:** `libs/database`

Supabase client factories (browser, server-publishable, admin). Wraps `src/integrations/supabase/*`.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `libs/database/src/` and its `index.ts` becomes the package entry.
