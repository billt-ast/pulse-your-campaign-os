# @pulse/kernel — the Pulse Operating System

Every application (Mission Control, Admin Console, Public Portal, Mobile)
consumes kernel APIs. Kernels own the intelligence; applications stay thin.

```
Applications  →  Kernels  →  Domain services  →  Platform Data Kernel  →  Infrastructure
```

## Layout
- `types.ts` — kernel ids, `KernelMeta`, `KernelModule`, `RuntimeContext`, config.
- `events.ts` — `EventBus` + `DomainEventEnvelope` (the platform bus).
- `contracts/*.ts` — one file per kernel: public interfaces + `KernelMeta`
  (purpose, dependencies, published/consumed events, extension points).
- `adapters/memory.ts` — in-memory providers for phases 2B.1.1–2B.1.3.
- `registry.ts` — the dependency graph and derived boot order.
- `boot.ts` — `bootKernel()` / `kernel()` lifecycle + health + shutdown.

## Rules
1. Applications talk only to kernel APIs.
2. Domain services never touch infrastructure providers directly.
3. A kernel may resolve only the peers it declares in `dependencies`; the boot
   handle throws on undeclared access.
4. Cross-kernel side effects go through the Event Kernel unless synchronous
   behaviour is required.
5. Business logic never lives inside an adapter.

## Usage
```ts
import { kernel, type MissionKernelApi } from "@/kernel";

const k = await kernel();
const missions = k.get<MissionKernelApi>("mission");
```
