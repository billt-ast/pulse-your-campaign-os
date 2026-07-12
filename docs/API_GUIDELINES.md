# API Guidelines

Pulse has two server-side surfaces:

1. **`createServerFn`** — typed RPC from the browser to the Worker.
   Use for every app-internal read and write.
2. **Server routes under `src/routes/api/public/*`** — raw HTTP for
   webhooks, cron, and public REST endpoints.

## createServerFn (default)

- File suffix `*.functions.ts(x)`.
- Chain order is fixed: `createServerFn({ method }).middleware(...).inputValidator(zod).handler(...)`.
- Use `.middleware([requireSupabaseAuth])` whenever the fn touches user data.
- Read `process.env.*` **inside** `.handler()` only.
- Never `import "@/integrations/supabase/client.server"` at module scope in a
  `.functions.ts` file — load it inside the handler with `await import(...)`.
- Never call a `requireSupabaseAuth` fn from a public-route loader.

```ts
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listMyCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(() => z.object({}).parse({}))
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("campaigns").select("*");
    if (error) throw error;
    return data;
  });
```

## Server routes (public HTTP)

- File under `src/routes/api/public/*.ts`.
- Handler shape: `Route = createFileRoute("/api/public/...")({ server: { handlers: { POST: ... } } })`.
- Validate the caller: HMAC signature for webhooks, `apikey` for pg_cron.
- Validate the body with Zod before touching the DB.
- Load `supabaseAdmin` inside the handler with `await import(...)`.
- Return `Response.json(...)` with explicit status codes.

## Naming

- `getX`, `listX`, `createX`, `updateX`, `deleteX`, `X` (side-effect verb).
- Files named after the aggregate: `campaigns.functions.ts`, not `api.ts`.

## Error handling

- Throw `Error` with a stable, non-PII message.
- Server route handlers surface the provider's status and body verbatim
  when relaying gateway errors.
- Never swallow errors silently. `console.error` at minimum.

## Versioning

- Additive changes only. Renames ship as a new server fn; old fn stays until
  every caller is migrated.
- Domain event payloads carry a `version` field.
