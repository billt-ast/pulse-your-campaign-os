# Pulse Kernel Specification (Phase 2B.1.1)

**Status:** Architecture baseline — contracts + lifecycle implemented,
infrastructure deliberately mocked until phase 2B.1.4.

## Vision
Applications should be thin. Intelligence belongs inside the Kernel.

## Runtime layers
```text
Applications      Mission Control · Admin Console · Public Portal · Mobile
        ▲
Pulse Kernels     Identity · Mission · Context · Workflow · Spatial · Knowledge
                  Analytics · Event · Notification · Platform Data · Storage
                  Integration · Security · AI · Design
        ▲
Infrastructure    Supabase · Neon · MongoDB Atlas · Redis · Blob Storage
connectors        Mapbox · Twilio · Meta · Google · Microsoft · Resend
```
Nothing bypasses the kernel. Ever.

## Kernels
| Kernel | Purpose | Depends on |
| --- | --- | --- |
| Security | Encryption, secrets, policy, rate limits, audit | — |
| Platform Data | Repositories, transactions, cache, read/write models | security |
| Identity | Auth, sessions, RBAC/ABAC, membership, workspace switching | security, data |
| Context | Org / workspace / mission / geography / user / locale / theme / time | identity |
| Event | Domain events, queues, retries, dead letters | security |
| Mission | Organizations, workspaces, missions, programs, projects, communities | data, identity, context, event |
| Workflow | State machines, approvals, escalations, timers | event, mission, context |
| Knowledge | Indexing, versions, entity links, knowledge graph, RAG prep | data, storage, event |
| Spatial | Boundaries, layers, ingestion, spatial search, heatmaps | data, context, integration |
| Analytics | Aggregation, KPIs, trends, forecasts, summaries | data, event, context |
| Notification | Email, SMS, push, in-app, realtime | event, integration, context |
| Integration | Every external vendor behind one boundary | security, event |
| Storage | Documents, media, GIS, 3D, archives, versioning | security, data |
| AI | Prompt registry, embeddings, retrieval, context builder | knowledge, context, security |
| Design | Tokens, typography, color, spacing, motion, charts | context |

Each contract file declares `purpose`, `dependencies`, `publishes`,
`consumes` and `extensionPoints`, which are the machine-readable form of the
kernel contract checklist.

## Boot sequence
`resolveBootOrder()` topologically sorts the registry, producing:

```text
security → data → identity → context → event → mission → workflow → storage →
knowledge → integration → spatial → analytics → notification → ai → design
```

`bootKernel()` initializes modules in that order and hands each one a handle
that can resolve **only** its declared dependencies — an undeclared
`resolve()` throws. Shutdown drains the event bus, then tears modules down in
reverse order.

## Provider mode
`KernelConfig.providerMode` is `"memory"` through phases 2B.1.1–2B.1.3.
Unimplemented operations throw `NotImplementedYet` rather than silently
returning fake data, so gaps are explicit. Phase 2B.1.4 swaps adapters for
Supabase / Neon / MongoDB / Redis / blob storage without touching a single
domain or application module.

## Dependency rules (enforced or documented)
1. Applications may call only kernel APIs. *(convention + review)*
2. A kernel resolves only declared peers. *(enforced at boot)*
3. Dependency cycles are rejected. *(enforced by `resolveBootOrder`)*
4. Cross-kernel effects prefer the Event Kernel. *(convention)*
5. Adapters contain no business logic. *(convention + review)*

## Acceptance criteria status
- Documented contracts for every kernel — done.
- Explicit kernel dependencies — done, machine-readable.
- Applications depend only on kernel APIs — boundary established.
- Platform boots with mocked infrastructure — `bootKernel()` boots 15 modules.
- Real infrastructure attachable later without domain changes — adapter seam.

## Roadmap
| Phase | Scope |
| --- | --- |
| 2B.1.1 | Kernel contracts and lifecycle (this document) |
| 2B.1.2 | Design Kernel implementation |
| 2B.1.3 | Identity, Context, Mission, Workflow on mocked providers |
| 2B.1.4 | Platform Data Kernel with real databases |
| 2B.1.5 | Remaining kernels + event bus activation |
