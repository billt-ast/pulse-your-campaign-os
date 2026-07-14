# Observability

## Logging

Structured JSON via `@/libs/logging`. One line per event; fields include
`ts`, `level`, `msg`, plus any bindings from `logger.child({...})`.

```ts
import { logger } from "@/libs/logging";
const log = logger.child({ requestId, organizationId });
log.info("mission.created", { missionId });
```

Level is controlled by `LOG_LEVEL` (`debug | info | warn | error`,
default `info`). Cloudflare Workers ships every line to the log drain.

## Metrics + tracing

`@/libs/observability` exposes:

- `newRequestId()` — correlation id per request
- `metric(name, value, tags)` — counter / gauge emitted as a log line
- `trace(name, ctx, fn)` — wraps an async block with duration + status
- `healthPayload()` — payload for `/api/public/health`

These wrap `console.*` today and are shaped for a future OpenTelemetry
backend without any call-site changes.

## Audit

Consequential mutations emit a `domainEvent` (see
`@/packages/validators`). The `services/audit` context appends them to an
immutable audit table with per-tenant RLS.

## Startup checks

`src/start.ts` calls `assertServerEnv()` before wiring middleware. If the
environment is misconfigured the process refuses to boot and logs a
line-by-line explanation.
