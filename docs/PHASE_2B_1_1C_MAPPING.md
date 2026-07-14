# Phase 2B.1.1C — Lovable Mapping

The upstream spec targets a pnpm + Turborepo + Docker + GitHub Actions
platform. Lovable is a single-app repo deployed to Cloudflare Workers,
so several deliverables map to different but equivalent surfaces. This
document lists every deliverable and where it lives in Pulse today.

## Delivered in Pulse

| Spec deliverable                          | Where it lives                                              |
| ----------------------------------------- | ----------------------------------------------------------- |
| Centralized env abstraction               | `src/libs/environment/` — Zod schemas for client + server   |
| Runtime env validation + startup errors   | `assertServerEnv()` wired into `src/start.ts`               |
| Env example / typed access                | `.env.example`, `clientEnv()`, `serverEnv()`                |
| Structured JSON logging                   | `src/libs/logging/`                                         |
| Metrics + tracing + request ids           | `src/libs/observability/`                                   |
| Shared design system consumed by every UI | `src/components/pulse/` + `@/packages/design-system`        |
| Shared typed contracts per domain         | `src/services/*/contracts.ts` + `@/packages/validators`     |
| Mission model as primary abstraction      | `mission`, `program`, `project`, `community`, `knowledge` in `@/packages/validators`; docs in [`MISSION_MODEL.md`](./MISSION_MODEL.md) |
| Developer setup guide                     | [`DEVELOPER_SETUP.md`](./DEVELOPER_SETUP.md)                |
| Architecture overview                     | [`ARCHITECTURE.md`](./ARCHITECTURE.md)                      |
| Workspace map                             | [`WORKSPACE_MAP.md`](./WORKSPACE_MAP.md)                    |
| Package registry                          | [`PACKAGE_REGISTRY.md`](./PACKAGE_REGISTRY.md)              |
| Service registry                          | [`SERVICE_REGISTRY.md`](./SERVICE_REGISTRY.md)              |
| Environment guide                         | [`ENVIRONMENT.md`](./ENVIRONMENT.md)                        |
| Contribution workflow                     | [`CONTRIBUTING.md`](./CONTRIBUTING.md)                      |
| Release workflow                          | [`RELEASE_WORKFLOW.md`](./RELEASE_WORKFLOW.md)              |
| Observability                             | [`OBSERVABILITY.md`](./OBSERVABILITY.md)                    |
| Security-by-default (RLS, verified inbound)| [`SECURITY.md`](./SECURITY.md)                              |
| Audit + immutable logs                    | `services/audit` context + `domainEvent` schema             |
| ESLint + Prettier                         | `eslint.config.js`, `.prettierrc`                           |
| CI stubs (pull request + main)            | `.github/workflows/README.md`                               |

## Mapped to Lovable-native equivalents

| Spec deliverable                | Lovable-native equivalent                                   |
| ------------------------------- | ----------------------------------------------------------- |
| `pnpm` + Turborepo bootstrap    | Lovable auto-installs on preview; scripts in `package.json` |
| Docker + docker-compose         | Lovable Cloud provisions Postgres + Auth + Storage + edge; no local containers needed |
| Hot reload                      | Vite dev server (SSR + HMR) via `bun run dev`               |
| Auto migrations                 | Lovable Cloud migration flow (`CREATE TABLE` → `GRANT` → RLS → policy) |
| Seed environment                | Seed data ships as an idempotent SQL migration              |
| Husky + lint-staged + Commitlint| Activate on GitHub export; documented in `CONTRIBUTING.md`  |
| Vitest / Playwright             | Configurable post-export; see `tests/README.md`             |
| GitHub Actions pipelines        | Stubs under `.github/workflows/`                            |
| Storybook + visual regression   | Runs locally on export; design system already extracted     |

## Not applicable on Lovable

- Multi-app deployment (Next.js + NestJS + Expo) — Lovable is single-app TanStack Start.
- Terraform / GCP infra — Cloudflare + Supabase are managed.
- Externally-hosted Redis / Mongo — not needed for Phase 2 goals.

Every non-applicable item is captured here for future migration and does
not block Phase 2B.1.2.
