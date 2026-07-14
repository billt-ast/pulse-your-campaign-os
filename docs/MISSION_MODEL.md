# Mission Model

Mission is the primary operational abstraction in Pulse. Campaigns,
governance initiatives, NGO programs, and advocacy pushes are all
**mission types** — not separate architectural roots. This keeps every
downstream module (analytics, communities, knowledge, notifications)
reusable across operational contexts.

## Entity hierarchy

```
Organization
└── Workspace (optional sub-tenant)
    └── Mission                       (type: campaign | governance | ngo_program | ...)
        ├── Program                   (stream of work)
        │   └── Project               (bounded initiative)
        ├── Community                 (audience / constituency)
        └── Knowledge                 (docs, briefs, playbooks)
```

Analytics events, audit entries, notifications, GIS features and media
assets attach to a mission via `missionId` (nullable when the record is
organization-scoped rather than mission-scoped).

## Mission types

| Type              | Example                                             |
| ----------------- | --------------------------------------------------- |
| `campaign`        | Election campaign, product launch                   |
| `governance`      | Legislative session, policy rollout                 |
| `ngo_program`     | Field program, grant cycle                          |
| `advocacy`        | Coalition push, ballot initiative                   |
| `civic_engagement`| Community organizing initiative                     |
| `internal`        | Ops project (hiring drive, org-wide initiative)     |

## Status lifecycle

`draft → planning → active → paused → completed → archived`

Any transition emits a `mission.status_changed` domain event on
`libs/events`, consumed by `services/audit` and `services/notifications`.

## Contract entry points

- `@/packages/validators` — `mission`, `program`, `project`, `community`,
  `knowledgeItem`, plus `missionType` / `missionStatus` enums.
- `@/services/campaigns/contracts` — campaign-shaped projections.
- `@/services/organizations/contracts` — tenant boundary.
