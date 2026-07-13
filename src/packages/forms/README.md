# @pulse/forms

**Kind:** packages
**Lovable path:** `src/packages/forms`
**Future workspace path:** `packages/forms`

Form field composition on react-hook-form + zod. Field, Fieldset, FormRow.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `packages/forms/src/` and its `index.ts` becomes the package entry.
