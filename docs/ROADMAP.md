# Roadmap

## Phase 2A — Immersive Product Experience ✅

- Cinematic landing route (`/`)
- Design tokens (paper / ink / navy / civic)
- Demo request funnel
- Accessibility pass (keyboard, focus, semantics)
- Responsive mobile drawer nav

## Phase 2B.1.1 — Platform Genesis ✅ *(this phase)*

- Lovable Cloud enabled (Postgres + Auth + Storage)
- Pulse design system extracted (`src/components/pulse/`)
- `_authenticated` layout with managed auth gate
- Public `/auth` route (email + Google)
- Mission Control shell (`/dashboard`) + Admin console (`/admin`)
- Scaffolded routes for every core context
- Documentation initialized (this repo)
- Engineering standards & scripts configured

## Phase 2B.1.2 — Identity & Organizations *(next)*

- `profiles`, `organizations`, `memberships`, `user_roles` tables + RLS
- `has_role()` security-definer function
- Multi-tenant org switcher in `AppShell`
- Invitations flow
- Admin console: tenant list, member list

## Phase 2B.1.3 — Data Foundations

- Domain event bus (Postgres triggers → `pg_net`)
- Audit stream (append-only `audit_entries` table)
- Structured logging + error surfacing
- Vitest configuration + first test suite
- Playwright e2e configuration

## Phase 2B.2 — Campaigns MVP

- Campaign aggregate, lifecycle states
- Milestone & calendar UI
- Volunteer roster (integrating identity)
- Field-operation records with geospatial coords

## Phase 2B.3 — Geospatial Intelligence

- Mapbox GL JS integration (replace `MapFrame`)
- PostGIS-backed catchments & boundaries
- Layer authoring surface

## Phase 2B.4 — Analytics & AI

- Recharts adoption (replace `ChartFrame`)
- Metric definitions + dashboards
- Lovable AI Gateway wired into `/ai`
- Briefing generator (RAG over knowledge context)

## Phase 2B.5 — Knowledge, Media, Notifications, Search

- Document editor + versioning
- Storage buckets + media library
- Notification fan-out service
- Full-text + semantic search
