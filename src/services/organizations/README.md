# @pulse/organizations

**Kind:** services
**Lovable path:** `src/services/organizations`
**Future workspace path:** `services/organizations`

Tenants, workspaces, memberships, invitations.

## Boundary rules
- Import UP into shared primitives, never SIDEWAYS across siblings.
- No route/UI code in `services/*`, `libs/*`, `workers/*`.
- Exports flow through `index.ts` (barrel). No deep imports from consumers.

## Extraction plan
When Pulse graduates to a real pnpm workspace, this folder moves verbatim
to `services/organizations/src/` and its `index.ts` becomes the package entry.
