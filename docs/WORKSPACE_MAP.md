# Workspace Map

Authoritative listing of every logical module in the Pulse repo. Groups
mirror the future pnpm workspace layout (see
[`MONOREPO_MAPPING.md`](./MONOREPO_MAPPING.md)).

## packages/  — reusable primitives

Consumed by any layer. No side-effects, no route/UI-app coupling.

- `ai-sdk`, `analytics-sdk`, `animations`, `auth`, `charts`, `config`,
  `design-system`, `feature-flags`, `forms`, `gis-sdk`, `hooks`, `icons`,
  `maps`, `navigation`, `notifications-sdk`, `tables`, `telemetry`,
  `theme`, `types`, `ui`, `utils`, **`validators`**

`validators` exports the shared Zod primitives + Mission model consumed by
every service contract.

## services/  — domain server logic

Each folder owns a bounded context, exposed exclusively via
`createServerFn` handlers and typed contracts in `contracts.ts`.

- `ai`, `analytics`, `audit`, `campaigns`, `communications`, `communities`,
  `documents`, `events`, `gis`, `identity`, `integrations`, `issues`,
  `knowledge`, `media`, `notifications`, `organizations`, `permissions`,
  `projects`, `search`

## libs/  — platform primitives

- `cache`, `constants`, `database`, **`environment`**, `errors`, `events`,
  `feature-flags`, `http`, **`logging`**, **`observability`**,
  `permissions`, `queues`, `security`, `storage`

Bolded modules are implemented in this phase; the rest are documented
scaffolds ready for their first implementation.

## workers/  — background jobs

Recipes implemented via `pg_cron` + `pg_net` + server routes under
`/api/public/workers/*`.

- `ai-worker`, `analytics-worker`, `cleanup-worker`, `email-worker`,
  `event-worker`, `gis-processor`, `import-worker`, `knowledge-worker`,
  `notification-worker`, `scheduler`, `search-indexer`, `sms-worker`
