# Domain Model

Pulse is organized as a set of **bounded contexts** in the DDD sense. Each
context owns its own aggregates, invariants and vocabulary; cross-context
communication happens through domain events, never direct writes.

## Contexts

### Identity
- **Aggregate roots**: `Person`, `Cohort`
- **Value objects**: `ContactChannel`, `ConsentGrant`
- **Owns**: identity graph, consent state, cohort membership

### Organizations
- **Aggregate roots**: `Organization`, `Membership`, `Role`
- **Owns**: tenant structure, invitations, permission grants
- **Invariant**: every user has exactly one active `Membership` per org

### Campaigns
- **Aggregate roots**: `Campaign`, `Milestone`, `FieldOperation`
- **Owns**: lifecycle, calendar, strategy canvas
- **Emits**: `CampaignPublished`, `MilestoneReached`, `OpsCommenced`

### GIS
- **Aggregate roots**: `Layer`, `Catchment`, `Boundary`
- **Owns**: geospatial primitives; enrichment of other contexts' entities
- **Invariant**: geometries stored in a canonical SRID

### Knowledge
- **Aggregate roots**: `Document`, `Decision`, `Playbook`
- **Owns**: versioned narrative content

### Notifications
- **Aggregate roots**: `NotificationChannel`, `Preference`
- **Owns**: fan-out, delivery, per-user preferences
- **Consumes**: domain events from every other context

### Analytics
- **Aggregate roots**: `MetricDefinition`, `Dashboard`, `Export`
- **Read-only** consumer of the event stream

### Search
- **Aggregate roots**: `Index`, `SavedSearch`
- **Read-only** projection over other contexts

### Media
- **Aggregate roots**: `Asset`, `RightsGrant`
- **Cross-cuts** campaigns, knowledge and public site

### AI
- **Aggregate roots**: `Agent`, `PromptTemplate`, `Briefing`
- **Consumes** any read model; **emits** derived artifacts

### Audit
- **Aggregate roots**: `AuditEntry`
- **Append-only**, immutable, cross-context

## Cross-context contracts

Domain events are the ONLY channel between contexts. Payloads are versioned
(`v1`, `v2`, …) and validated with Zod. A context that renames a field ships
a new event version without touching consumers.

## Persistence

- Postgres schemas mirror the contexts (`identity.*`, `campaigns.*`, …)
  where isolation matters. `public` remains the default schema for
  contexts still evolving.
- All user-data tables enable RLS and scope by `organization_id` +
  `auth.uid()`.
- Roles live in a dedicated `user_roles` table checked via a
  `security definer` `has_role()` function — never on `profiles`.

## Read/write patterns

- **Reads**: TanStack Query + server fn as the signed-in user (RLS applies).
- **Writes**: server fn → transactional Postgres → emits domain event via
  trigger; `pg_net` and `/api/public/*` handle outbound side-effects.
- **Public reads** (rare): server publishable client + narrow `TO anon`
  policies + explicit column projection.
