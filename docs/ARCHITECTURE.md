# Architecture

## 1. Platform reality vs. original constitution

The Phase 2B.1.1 constitution names Next.js 15, NestJS, pnpm monorepo,
Neon, MongoDB Atlas, Upstash, Auth0, Terraform and GCP. Pulse is built on
Lovable, which is a **single-app TanStack Start project deployed to
Cloudflare Workers**, backed by Lovable Cloud (Postgres + Auth + Storage +
Edge Functions). This document captures the *equivalent* architecture that
honours the constitution's intent — DDD, event-driven, modular, documented,
typed, observable, testable — inside the platform's constraints.

| Constitution              | Pulse on Lovable                              |
| ------------------------- | --------------------------------------------- |
| Next.js 15 + NestJS       | TanStack Start (React 19 SSR + server fns)    |
| pnpm monorepo             | Single-app repo; modules are folder-scoped    |
| Node.js backend           | Cloudflare Workers (nodejs_compat)            |
| Neon Postgres             | Lovable Cloud Postgres                        |
| Supabase / Auth0          | Lovable Cloud Auth (email + Google)           |
| MongoDB Atlas             | JSONB columns in Postgres (document patterns) |
| Upstash Redis             | Deferred; Postgres caches for now             |
| Terraform / GCP / Vercel  | Lovable-managed hosting                       |
| Drizzle ORM               | Supabase client + generated types             |

## 2. Runtime topology

```
┌──────────────────────────────────────────────────────────────────┐
│  Browser (React 19 SPA + SSR shell)                              │
│    · TanStack Router (typed, file-based)                         │
│    · TanStack Query (server state)                               │
│    · Pulse design system                                         │
└──────────────────────────────────────────────────────────────────┘
                    │  same-origin fetch / RPC
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│  Cloudflare Worker (Nitro / TanStack Start)                      │
│    · createServerFn RPC (app-internal logic)                     │
│    · /api/public/*   (webhooks, cron, public APIs)               │
│    · requireSupabaseAuth middleware                              │
└──────────────────────────────────────────────────────────────────┘
                    │  bearer token / service role
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│  Lovable Cloud                                                   │
│    · Postgres (per-tenant RLS, pg_cron, pg_net)                  │
│    · Auth (email + Google OAuth broker)                          │
│    · Storage (buckets)                                           │
│    · Edge Functions (external webhooks only)                     │
│    · Lovable AI Gateway (Gemini / GPT models)                    │
└──────────────────────────────────────────────────────────────────┘
```

## 3. Application boundaries

Three logical applications share the single codebase and the design system:

| App             | Surface                                    | Routes                          |
| --------------- | ------------------------------------------ | ------------------------------- |
| **Public**      | Landing, marketing, sign-in                | `/`, `/auth`                    |
| **Mission Control** | Authenticated operator workspace       | `/_authenticated/*` (except `/_authenticated/admin`) |
| **Admin**       | Super-admin platform console               | `/_authenticated/admin`         |

A future mobile application is anticipated but out of scope here.

## 4. Module map (bounded contexts)

Each core module is scaffolded as a protected route with a scoped folder for
future components, server functions and schema migrations.

| Context        | Route path              | Responsibility                                  |
| -------------- | ----------------------- | ----------------------------------------------- |
| Identity       | `/identity`             | People, contacts, roles, cohorts                |
| Organizations  | `/organizations`        | Tenants, workspaces, members, permissions       |
| Campaigns      | `/campaigns`            | Campaign lifecycle, strategy, ops               |
| GIS            | `/gis`                  | Geospatial layers, catchments, boundaries       |
| Knowledge      | `/knowledge`            | Docs, decisions, playbooks                      |
| Notifications  | `/notifications`        | Event fan-out, in-app + email + webhook         |
| Analytics      | `/analytics`            | Dashboards, KPIs, exports                       |
| Search         | `/search`               | Universal search, command palette               |
| Media          | `/media`                | Assets, rights, usage                           |
| AI             | `/ai`                   | Agents, briefings, prompts                      |
| Audit          | `/audit`                | Append-only audit stream, access reviews        |

## 5. Cross-cutting concerns

- **Design system** — `src/components/pulse/` (see [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md))
- **Auth** — Managed `_authenticated` gate + bearer middleware
- **Data access** — RLS-first; server fns call Supabase as the signed-in user
- **Events** — Postgres triggers → notification service; `pg_net` for outbound
- **Observability** — Structured `console.*`, error boundary reporting
- **Zero Trust** — Every table has RLS; every privileged fn re-authorizes
- **Geospatial awareness** — PostGIS-ready columns on every location entity

## 6. Deployment

Every commit is built as a preview by Lovable and can be published to the
production URL. Cloudflare Workers is the runtime for both SSR and API
routes. There is no separate infrastructure repository — configuration lives
in `vite.config.ts` and Lovable-managed environment variables.
