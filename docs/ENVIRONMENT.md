# Environment Guide

Pulse uses two runtime environments backed by a single validation layer
(`src/libs/environment`). Startup fails fast with a formatted, itemized
error whenever a variable is missing or malformed.

## Profiles

| Profile     | Purpose                              | Backend                 |
| ----------- | ------------------------------------ | ----------------------- |
| development | Local Lovable preview + `bun run dev`| Lovable Cloud (dev)     |
| preview     | Lovable preview builds               | Lovable Cloud (dev)     |
| staging     | Optional pre-prod (self-host)        | Separate Supabase project |
| production  | Published Lovable / custom domain    | Lovable Cloud (prod)    |
| test        | Vitest / Playwright                  | Ephemeral               |

Selected by `NODE_ENV` — validated by the server schema.

## Client vs Server

- `VITE_*` variables are inlined at build time. They are safe to expose.
- Unprefixed variables are read via `process.env.*` inside server code only.

The two are parsed separately: `clientEnv()` and `serverEnv()`. Both throw
if invalid. See [`.env.example`](../.env.example) for the full list.

## Secrets

Secrets are never committed. On Lovable Cloud they are injected by the
platform. When exporting, populate them from your secret store (1Password
Connect, Doppler, Vault, Cloudflare Secrets, etc.) — never a checked-in
`.env`.

## Adding a new variable

1. Add it to `.env.example` with a placeholder.
2. Add it to `clientSchema` or `serverSchema` in
   `src/libs/environment/index.ts`.
3. Read it via `clientEnv()` / `serverEnv()` — never bare `process.env.X`.
