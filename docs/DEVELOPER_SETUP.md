# Developer Setup

One-command bootstrap for local development on Lovable — and a mechanical
path for exporting the repo to run under pnpm + Turborepo later.

## Prerequisites

- Node.js 22.x (Lovable's build image ships this)
- `bun` (Lovable default) or `npm` / `pnpm` if running outside Lovable
- A Lovable Cloud project (Supabase-managed) — auto-provisioned

## Bootstrap (Lovable)

Lovable installs dependencies, provisions Supabase, and starts the dev
server automatically the first time a preview is requested. No manual
commands required.

## Bootstrap (self-host / GitHub export)

```bash
cp .env.example .env       # populate from your secret store
bun install                # or pnpm install
bun run dev                # Vite dev server on :8080
```

### Available scripts

| Script          | What it does                                                |
| --------------- | ----------------------------------------------------------- |
| `bun run dev`   | Vite dev server (SSR + HMR)                                 |
| `bun run build` | Production build (Cloudflare Worker target via Nitro)       |
| `bun run build:dev` | Development-mode build used by Lovable preview         |
| `bun run preview` | Preview built assets                                      |
| `bun run lint`  | ESLint over `**/*.{ts,tsx}`                                 |
| `bun run format`| Prettier over the repository                                |

Scripts spec'd in Phase 2B.1.1C but not shipped in this phase
(`test`, `typecheck`, `storybook`, `seed`, `docs`, `reset`) map to future
tooling documented in [ENGINEERING_GUIDELINES.md](./ENGINEERING_GUIDELINES.md).
Typecheck is enforced automatically by the Lovable build.

## Environment

Every env var is described in [`ENVIRONMENT.md`](./ENVIRONMENT.md). At
startup the server runs `assertServerEnv()` and refuses to boot with a
clear, itemized error if anything is missing or malformed.

## Database migrations

Schema changes ship as SQL migrations reviewed through the Lovable Cloud
migration flow. The order is always `CREATE TABLE` → `GRANT` → `ENABLE RLS`
→ `CREATE POLICY`. See [`SECURITY.md`](./SECURITY.md).
