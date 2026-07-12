# System Context

```
                        ┌───────────────────┐
                        │   Public users    │
                        │  (landing / SEO)  │
                        └─────────┬─────────┘
                                  │
                        ┌─────────▼─────────┐
                        │  Campaign staff   │────────┐
                        │  (operators)      │        │
                        └─────────┬─────────┘        │
                                  │                  │
                        ┌─────────▼─────────┐        │
                        │  Platform admins  │        │
                        └─────────┬─────────┘        │
                                  │                  │
                    ┌─────────────▼──────────────┐   │
                    │           PULSE            │◀──┘
                    │  (TanStack Start · Worker) │
                    └──┬────────┬──────────┬─────┘
                       │        │          │
        ┌──────────────▼─┐  ┌───▼────┐  ┌──▼────────────┐
        │ Lovable Cloud  │  │Lovable │  │ External       │
        │ Postgres/Auth/ │  │  AI    │  │ webhooks,      │
        │ Storage/EdgeFn │  │Gateway │  │ email, maps    │
        └────────────────┘  └────────┘  └────────────────┘
```

## External actors

| Actor            | Interaction                                             |
| ---------------- | ------------------------------------------------------- |
| Public visitor   | Reads landing, requests demo, browses public content    |
| Operator         | Signs in, runs Mission Control                          |
| Platform admin   | Manages tenants, feature flags, health                  |
| External systems | Webhooks in via `/api/public/*`; outbound via `pg_net`  |
| AI models        | Called through Lovable AI Gateway (no user API keys)    |

## Trust boundaries

1. **Browser ↔ Worker** — same-origin; every server fn is validated.
2. **Worker ↔ Cloud** — bearer token as the user (RLS) OR service role for
   verified privileged operations only.
3. **Worker ↔ External** — outbound over HTTPS; inbound signature-verified.
