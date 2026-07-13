# Deployment

Pulse deploys through Lovable. Every commit produces a preview build; the
"Publish" action promotes the current preview to production.

| Environment | URL pattern                                    | Notes                              |
| ----------- | ---------------------------------------------- | ---------------------------------- |
| Preview     | `id-preview--<project>.lovable.app`            | Ephemeral, tied to the latest build |
| Preview (stable) | `project--<project-id>-dev.lovable.app`   | Stable for webhooks / cron         |
| Production  | `<slug>.lovable.app` + custom domains          | Promoted via Publish                |
| Production (stable) | `project--<project-id>.lovable.app`    | Stable for webhooks / cron         |

The runtime is Cloudflare Workers (Nitro / TanStack Start). Backend
services (Postgres, Auth, Storage, Edge Functions, pg_cron, pg_net) run on
Lovable Cloud.

## Environment variables

- Client-visible: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
  `VITE_SUPABASE_PROJECT_ID`.
- Server-only: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, plus any secret added via `add_secret`.

## Migrations

Database changes ship as SQL migrations approved through the Lovable
Cloud migration flow. Order matters: `CREATE TABLE` → `GRANT` → `ENABLE
RLS` → `CREATE POLICY`.
