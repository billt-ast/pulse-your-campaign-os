# @pulse/security

**Kind:** services
**Lovable path:** `src/services/security`
**Future workspace path:** `services/security`

Policies, secrets, rate limits and audit contracts.

## Kernel home
Primary kernel: **security** (`src/kernel/contracts/security.ts`).

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/security/src/` and its `index.ts` becomes the package entry.
