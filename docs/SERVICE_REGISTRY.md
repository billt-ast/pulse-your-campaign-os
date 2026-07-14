# Service Registry

Every service under `src/services/*` owns a bounded context. Contracts
live in `contracts.ts` and are exposed via the folder barrel. Server-fn
implementations land in `*.functions.ts` alongside the contracts.

| Service         | Bounded context                                             |
| --------------- | ----------------------------------------------------------- |
| `ai`            | Lovable AI completions and prompt orchestration             |
| `analytics`     | Event ingestion + typed query                               |
| `audit`         | Append-only audit trail                                     |
| `campaigns`     | Mission projections for campaign-typed missions             |
| `communications`| Outbound email + SMS                                        |
| `communities`   | Audience / constituency grouping                            |
| `documents`     | Long-form documents                                         |
| `events`        | Calendar and operational events                             |
| `gis`           | Geospatial features                                         |
| `identity`      | User profile + membership                                   |
| `integrations`  | External provider connections                               |
| `issues`        | Issue tracker                                               |
| `knowledge`     | Knowledge asset library                                     |
| `media`         | Storage uploads + asset metadata                            |
| `notifications` | Multi-channel notifications                                 |
| `organizations` | Tenant CRUD                                                 |
| `permissions`   | Role grants + policy evaluation                             |
| `projects`      | Projects under a mission                                    |
| `search`        | Cross-entity search                                         |

## Contract conventions

- `<verb><Entity>Request` / `<verb><Entity>Response` are Zod schemas.
- Lists use the shared `paginated(item)` helper.
- Every schema composes primitives from `@/packages/validators`.
- Server fns validate input via `.inputValidator(schema.parse)` and return
  typed DTOs — never raw Supabase rows.
