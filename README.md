# Pulse

**Pulse** is a modular, context-aware operating system for mission-oriented organizations — campaigns, governance, projects and community operations in one unified workspace.

This repository is the **Phase 2B.1.1 — Platform Genesis** scaffold: the engineering foundation, design system, application shell and route architecture for every phase that follows. No business logic is implemented yet.

## Stack

| Layer            | Choice                                                       |
| ---------------- | ------------------------------------------------------------ |
| Framework        | [TanStack Start](https://tanstack.com/start) (React 19, SSR) |
| Bundler          | Vite 7                                                       |
| Runtime target   | Cloudflare Workers via Nitro                                 |
| Styling          | Tailwind CSS v4 (CSS-first, `@theme`)                        |
| UI primitives    | shadcn/ui + Radix + Pulse design system                      |
| Motion           | Motion (Framer Motion)                                       |
| Icons            | Lucide                                                       |
| Data             | TanStack Query                                               |
| Backend          | Lovable Cloud (Postgres + Auth + Storage + Edge Functions)   |
| AI               | Lovable AI Gateway                                           |
| Forms            | React Hook Form + Zod                                        |
| Type safety      | TypeScript (strict), typed router                            |

> **Note on the original 2B.1.1 constitution.** The spec calls for a
> Next.js + NestJS pnpm monorepo. This repo adapts the same intent — DDD,
> event-driven, modular, documented — to the Lovable platform, which is
> single-app TanStack Start on Cloudflare Workers with Lovable Cloud as
> the backend. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the mapping.

## Scripts

```bash
bun dev            # Vite dev server
bun run build      # Production build
bun run build:dev  # Development build (checks SSR-safety)
bun run lint       # ESLint
bun run format     # Prettier
```

## Directory map

```
src/
  routes/                   File-based routing (TanStack Router)
    __root.tsx              Root shell, head metadata, SEO
    index.tsx               Public landing experience (Phase 2A)
    auth.tsx                Public sign-in / sign-up
    _authenticated/         Protected subtree (ssr:false, auth gate)
      route.tsx             The gate
      dashboard.tsx         Mission Control
      admin.tsx             Super Admin Console
      campaigns.tsx         Campaign lifecycle module
      organizations.tsx     Organizations & workspaces
      identity.tsx          People & identity graph
      gis.tsx               Geospatial intelligence
      analytics.tsx         Analytics & dashboards
      ai.tsx                Pulse AI copilots
      search.tsx            Universal search
      knowledge.tsx         Documents, playbooks, decisions
      media.tsx             Media library
      notifications.tsx     Event-driven notifications
      audit.tsx             Audit & security
  components/
    pulse/                  Pulse design system (AppShell, primitives, tokens)
    ui/                     shadcn primitives
  integrations/
    supabase/               Auto-generated Lovable Cloud clients
    lovable/                Managed social-auth wrapper
  lib/                      Shared utilities
  styles.css                Design tokens (@theme), utilities, keyframes
docs/                       Engineering & product documentation
```

## Documentation index

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — System architecture & module map
- [SYSTEM_CONTEXT.md](./docs/SYSTEM_CONTEXT.md) — External context diagram
- [ENGINEERING_PRINCIPLES.md](./docs/ENGINEERING_PRINCIPLES.md) — Non-negotiables
- [DOMAIN_MODEL.md](./docs/DOMAIN_MODEL.md) — DDD contexts & aggregates
- [API_GUIDELINES.md](./docs/API_GUIDELINES.md) — Server-fn & route conventions
- [CODING_STANDARDS.md](./docs/CODING_STANDARDS.md) — Style & structure
- [DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) — Tokens, primitives, motion
- [ROADMAP.md](./docs/ROADMAP.md) — Phased delivery plan
- [CONTRIBUTING.md](./docs/CONTRIBUTING.md) — Workflow

## Acceptance status (Phase 2B.1.1)

- ✅ Repository boots
- ✅ All packages compile
- ✅ Applications share a unified design system (`src/components/pulse/`)
- ✅ Documentation initialized
- ✅ Folder structure production-ready
- ✅ Development workflow configured
- ✅ Zero business logic
