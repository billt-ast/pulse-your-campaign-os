# Monorepo Mapping (Phase 2B.1.1B — Lovable Edition)

The Pulse constitution calls for a pnpm workspace with `apps/`, `packages/`,
`services/`, `workers/`, `libs/`, `infrastructure/`. Lovable projects are
**single-app TanStack Start repos** deployed to Cloudflare Workers — pnpm
workspaces, separate Next.js apps, NestJS services and Expo mobile apps are
not part of the platform.

This phase therefore implements the **same architectural boundaries as
folder-scoped modules inside `src/`**, with barrel exports, per-module
READMEs, and extraction rules that make a future migration to a real
workspace mechanical (move the folder, add `package.json`, done).

## Mapping table

| Constitution path            | Lovable path                              | Notes                                                     |
| ---------------------------- | ----------------------------------------- | --------------------------------------------------------- |
| `apps/mission-control`       | `src/routes/_authenticated/*`             | Operator workspace, gated by managed `_authenticated` layout |
| `apps/admin-console`         | `src/routes/_authenticated/admin.tsx`     | Super-admin sub-app inside the same router                |
| `apps/public-portal`         | `src/routes/index.tsx` + public routes    | SSR landing + public content                              |
| `apps/mobile`                | *(deferred)*                              | Expo cannot run on Lovable; scaffold when we exit         |
| `apps/docs`                  | `docs/` (Markdown) + future Storybook     | Static docs; Storybook runs locally when exported         |
| `packages/*`                 | `src/packages/*`                          | Barrel exports, no route/UI-app coupling                  |
| `services/*`                 | `src/services/*`                          | Domain server fns (`createServerFn`) + zod contracts      |
| `workers/*`                  | `src/workers/*` + `/api/public/workers/*` | pg_cron + `pg_net` + server routes; see per-worker README |
| `libs/*`                     | `src/libs/*`                              | Low-level platform libraries                              |
| `infrastructure/`            | `supabase/` + Lovable-managed hosting     | No Terraform; Lovable owns Cloudflare + Supabase config   |
| `.github/`, `.husky/`        | `.github/`, `.husky/` (stubs)             | CI hooks activate when the repo is exported to GitHub     |
| `configs/`, `scripts/`, ...  | Same names at repo root                   | Shared config surface for future extraction               |

## Boundary rules

1. **Import direction is one-way.** `routes/*` → `services/*` → `libs/*`.
   `packages/*` may be imported by any layer. `services/*` never import
   `routes/*`. `libs/*` never import anything above them.
2. **Barrels only.** Consumers import from `@/packages/<name>` or
   `@/services/<name>` — never deep paths. This preserves the future
   package boundary.
3. **No sideways imports.** A service never imports another service; it
   emits or consumes a domain event via `libs/events`.
4. **Server-only stays server-only.** Anything under `services/*` and
   `libs/*` that touches secrets ships as `*.server.ts` or lives inside a
   `createServerFn` handler.

## Extraction checklist (future)

When Pulse graduates to a real pnpm workspace:

1. `mv src/packages/<name> packages/<name>/src` and add a `package.json`.
2. `mv src/services/<name> services/<name>/src` similarly.
3. Replace `@/packages/<name>` imports with `@pulse/<name>`.
4. Introduce `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`.
5. Split the current app into `apps/mission-control`, `apps/admin-console`,
   `apps/public-portal` by moving the corresponding route trees.

Because every module already ships with its own README and barrel, the
migration is a rename + config task — not a rewrite.
