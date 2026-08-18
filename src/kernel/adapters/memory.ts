/**
 * In-memory kernel adapters (phases 2B.1.1 – 2B.1.3).
 *
 * These satisfy every kernel contract without touching infrastructure, so the
 * platform can boot, be tested and be demoed before real providers are
 * attached in 2B.1.4. Swapping to live providers must not change domain logic.
 */
import { logger } from "@/libs/logging";
import { newRequestId } from "@/libs/observability";
import type {
  KernelConfig,
  KernelId,
  KernelMeta,
  KernelModule,
  RuntimeContext,
} from "../types";
import type { DomainEventEnvelope, EventBus, EventHandler } from "../events";
import { securityKernelMeta, type SecurityKernelApi } from "../contracts/security";
import { dataKernelMeta, type DataKernelApi, type QuerySpec, type Repository } from "../contracts/data";
import { identityKernelMeta, type IdentityKernelApi } from "../contracts/identity";
import { contextKernelMeta, type ContextKernelApi } from "../contracts/context";
import { eventKernelMeta, type EventKernelApi, type QueueService } from "../contracts/event";
import { missionKernelMeta } from "../contracts/mission";
import { workflowKernelMeta } from "../contracts/workflow";
import { spatialKernelMeta } from "../contracts/spatial";
import { knowledgeKernelMeta } from "../contracts/knowledge";
import { analyticsKernelMeta } from "../contracts/analytics";
import { notificationKernelMeta } from "../contracts/notification";
import { integrationKernelMeta } from "../contracts/integration";
import { storageKernelMeta } from "../contracts/storage";
import { aiKernelMeta } from "../contracts/ai";
import { designKernelMeta, type DesignKernelApi } from "../contracts/design";
import { palette, motion, layout, chartColors } from "@/components/pulse/tokens";

/** Marker error thrown by adapters whose live implementation lands later. */
export class NotImplementedYet extends Error {
  constructor(kernel: KernelId, operation: string) {
    super(`[kernel:${kernel}] ${operation} is not implemented in the memory adapter yet`);
    this.name = "NotImplementedYet";
  }
}

/* ---------------------------------------------------------------- */
/* Event bus + queues                                               */
/* ---------------------------------------------------------------- */

export function createMemoryEventBus(): EventBus {
  const handlers: { pattern: string; handler: EventHandler }[] = [];
  const dead: DomainEventEnvelope[] = [];
  const inflight: Promise<unknown>[] = [];

  const matches = (pattern: string, name: string) =>
    pattern === "*" || pattern === name || (pattern.endsWith("*") && name.startsWith(pattern.slice(0, -1)));

  return {
    async publish(name, payload, ctx) {
      const event: DomainEventEnvelope<typeof payload> = {
        id: newRequestId(),
        name,
        occurredAt: new Date().toISOString(),
        correlationId: ctx?.requestId ?? newRequestId(),
        organizationId: ctx?.organizationId ?? null,
        actorId: ctx?.userId ?? null,
        payload,
      };
      for (const { pattern, handler } of handlers) {
        if (!matches(pattern, name)) continue;
        const task = Promise.resolve()
          .then(() => handler(event as DomainEventEnvelope))
          .catch((error) => {
            dead.push(event as DomainEventEnvelope);
            logger.error("event handler failed", { event: name, error: (error as Error).message });
          });
        inflight.push(task);
      }
      return event;
    },
    subscribe(pattern, handler) {
      const entry = { pattern, handler };
      handlers.push(entry);
      return () => {
        const i = handlers.indexOf(entry);
        if (i >= 0) handlers.splice(i, 1);
      };
    },
    deadLetters: () => [...dead],
    async drain() {
      await Promise.all(inflight.splice(0, inflight.length));
    },
  };
}

function createMemoryQueues(): QueueService {
  const queues = new Map<string, Record<string, unknown>[]>();
  const workers = new Map<string, (p: Record<string, unknown>) => Promise<void>>();
  return {
    async enqueue(queue, payload) {
      const id = newRequestId();
      const worker = workers.get(queue);
      if (worker) {
        void worker(payload).catch((error) =>
          logger.error("queue worker failed", { queue, error: (error as Error).message }),
        );
      } else {
        queues.set(queue, [...(queues.get(queue) ?? []), payload]);
      }
      return id;
    },
    process(queue, handler) {
      workers.set(queue, handler);
      const backlog = queues.get(queue) ?? [];
      queues.set(queue, []);
      for (const payload of backlog) void handler(payload);
      return () => workers.delete(queue);
    },
    depth: (queue) => (queues.get(queue) ?? []).length,
  };
}

/* ---------------------------------------------------------------- */
/* Data (in-memory repositories + cache)                            */
/* ---------------------------------------------------------------- */

function createMemoryData(): DataKernelApi {
  const collections = new Map<string, Map<string, Record<string, unknown>>>();
  const cache = new Map<string, unknown>();
  const store = (name: string) => {
    if (!collections.has(name)) collections.set(name, new Map());
    return collections.get(name)!;
  };
  return {
    repository<T>(collection: string): Repository<T> {
      const rows = store(collection);
      return {
        async findById(id) {
          return (rows.get(id) as T) ?? null;
        },
        async list(spec?: QuerySpec) {
          let data = [...rows.values()] as T[];
          if (spec?.filter) {
            data = data.filter((row) =>
              Object.entries(spec.filter!).every(([k, v]) => (row as Record<string, unknown>)[k] === v),
            );
          }
          const limit = spec?.limit ?? 50;
          return { data: data.slice(0, limit), nextCursor: data.length > limit ? String(limit) : null };
        },
        async create(input) {
          const id = (input as { id?: string }).id ?? newRequestId();
          const row = { ...(input as Record<string, unknown>), id };
          rows.set(id, row);
          return row as T;
        },
        async update(id, input) {
          const row = { ...(rows.get(id) ?? { id }), ...(input as Record<string, unknown>) };
          rows.set(id, row);
          return row as T;
        },
        async remove(id) {
          rows.delete(id);
        },
      };
    },
    unitOfWork: { transaction: async (fn) => fn() },
    cache: {
      async get(key) {
        return (cache.get(key) as never) ?? null;
      },
      async set(key, value) {
        cache.set(key, value);
      },
      async invalidate(prefix) {
        for (const key of [...cache.keys()]) if (key.startsWith(prefix)) cache.delete(key);
      },
    },
    providerFor: () => "memory",
  };
}

/* ---------------------------------------------------------------- */
/* Security / identity / context / design                           */
/* ---------------------------------------------------------------- */

function createMemorySecurity(): SecurityKernelApi {
  const counters = new Map<string, { count: number; resetAt: number }>();
  return {
    encryption: {
      async encrypt(plaintext) {
        return `enc:${btoa(unescape(encodeURIComponent(plaintext)))}`;
      },
      async decrypt(ciphertext) {
        return decodeURIComponent(escape(atob(ciphertext.replace(/^enc:/, ""))));
      },
      async hash(value) {
        const bytes = new TextEncoder().encode(value);
        const digest = await crypto.subtle.digest("SHA-256", bytes);
        return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
      },
    },
    secrets: {
      async get(name) {
        return typeof process !== "undefined" ? (process.env?.[name] ?? null) : null;
      },
      async require(name) {
        const value = typeof process !== "undefined" ? process.env?.[name] : undefined;
        if (!value) throw new Error(`missing secret: ${name}`);
        return value;
      },
    },
    policies: { async evaluate(ctx, action) { return ctx.permissions.includes("*") || ctx.permissions.includes(action); } },
    rateLimiter: {
      async consume(key, limit, windowSeconds) {
        const now = Date.now();
        const entry = counters.get(key);
        if (!entry || entry.resetAt < now) {
          counters.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
          return { allowed: true, remaining: limit - 1 };
        }
        entry.count += 1;
        return { allowed: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
      },
    },
    audit: {
      async record(entry) {
        logger.info("audit", { ...entry });
      },
    },
  };
}

function createMemoryContext(config: KernelConfig): ContextKernelApi {
  let current: RuntimeContext = {
    requestId: newRequestId(),
    organizationId: null,
    workspaceId: null,
    missionId: null,
    userId: null,
    permissions: [],
    geography: null,
    locale: config.locale,
    timezone: config.timezone,
    theme: "system",
    now: new Date().toISOString(),
  };
  const base = { ...current };
  return {
    current: () => ({ ...current, now: new Date().toISOString() }),
    set(patch) {
      current = { ...current, ...patch };
      return current;
    },
    async with(patch, fn) {
      const previous = current;
      current = { ...current, ...patch };
      try {
        return await fn();
      } finally {
        current = previous;
      }
    },
    reset() {
      current = { ...base, requestId: newRequestId() };
    },
  };
}

function createMemoryIdentity(): IdentityKernelApi {
  const roles: Record<string, string[]> = {
    owner: ["*"],
    admin: ["mission.write", "mission.read", "identity.manage"],
    member: ["mission.read"],
    viewer: ["mission.read"],
  };
  return {
    identity: {
      async currentUser() {
        return null;
      },
      async signInWithPassword() {
        throw new NotImplementedYet("identity", "signInWithPassword");
      },
      async signInWithProvider() {
        throw new NotImplementedYet("identity", "signInWithProvider");
      },
      async signOut() {},
    },
    sessions: {
      async get() {
        return null;
      },
      async refresh() {
        return null;
      },
      async revoke() {},
    },
    permissions: {
      async can() {
        return false;
      },
      async listPermissions() {
        return [];
      },
    },
    roles: { roles: () => Object.keys(roles), permissionsFor: (role) => roles[role] ?? [] },
    organizations: {
      async membershipsFor() {
        return [];
      },
      async switchWorkspace() {
        throw new NotImplementedYet("identity", "switchWorkspace");
      },
    },
  };
}

function createMemoryDesign(context: ContextKernelApi): DesignKernelApi {
  return {
    tokens: () => ({
      color: { ...palette } as Record<string, string>,
      typography: { serif: "var(--font-serif)", sans: "var(--font-sans)" },
      spacing: {
        sidebar: `${layout.sidebarWidth}px`,
        topbar: `${layout.topbarHeight}px`,
        content: `${layout.contentMaxWidth}px`,
      },
      radius: { card: "var(--radius)", pill: "9999px" },
      motion: {
        fast: String(motion.duration.fast),
        base: String(motion.duration.base),
        slow: String(motion.duration.slow),
        cinematic: String(motion.duration.cinematic),
      },
    }),
    theme: () => context.current().theme,
    setTheme: (theme) => void context.set({ theme }),
    chartPalette: () => [...chartColors],
  };
}

/* ---------------------------------------------------------------- */
/* Deferred kernels — contracts fixed, adapters land in 2B.1.4/5    */
/* ---------------------------------------------------------------- */

function pending<T extends object>(id: KernelId, operations: string[]): T {
  const api: Record<string, unknown> = {};
  for (const op of operations) {
    const [group, method] = op.includes(".") ? op.split(".") : [null, op];
    if (group) {
      const bucket = (api[group] ??= {}) as Record<string, unknown>;
      bucket[method!] = async () => {
        throw new NotImplementedYet(id, op);
      };
    } else {
      api[op] = async () => {
        throw new NotImplementedYet(id, op);
      };
    }
  }
  return api as T;
}

/* ---------------------------------------------------------------- */
/* Module factory                                                   */
/* ---------------------------------------------------------------- */

function module<T>(meta: KernelMeta, factory: (runtime: { config: KernelConfig; resolve: <R>(id: KernelId) => R }) => T): KernelModule<T> {
  return {
    meta,
    init: (runtime) => factory(runtime),
    health: () => ({ id: meta.id, status: "healthy", detail: "memory adapter", checkedAt: new Date().toISOString() }),
  };
}

/** Every kernel module backed by in-memory adapters, in dependency order. */
export function createMemoryKernelModules(): KernelModule[] {
  return [
    module(securityKernelMeta, () => createMemorySecurity()),
    module(dataKernelMeta, () => createMemoryData()),
    module(identityKernelMeta, () => createMemoryIdentity()),
    module(contextKernelMeta, ({ config }) => createMemoryContext(config)),
    module(eventKernelMeta, (): EventKernelApi => ({ bus: createMemoryEventBus(), queues: createMemoryQueues() })),
    module(missionKernelMeta, () =>
      pending(missionKernelMeta.id, [
        "organizations.list", "organizations.create", "workspaces.listByOrganization",
        "missions.list", "missions.get", "missions.create", "missions.transition",
        "programs.listByMission", "projects.listByProgram", "communities.listByMission",
      ]),
    ),
    module(workflowKernelMeta, () => pending(workflowKernelMeta.id, ["register", "start", "send", "approve", "schedule"])),
    module(knowledgeKernelMeta, () => pending(knowledgeKernelMeta.id, ["index", "search", "related", "versions", "link"])),
    module(spatialKernelMeta, () => pending(spatialKernelMeta.id, ["layers", "boundaries", "search", "ingest", "heatmap"])),
    module(analyticsKernelMeta, () => pending(analyticsKernelMeta.id, ["track", "query", "kpis", "forecast", "summary"])),
    module(notificationKernelMeta, () => pending(notificationKernelMeta.id, ["send", "preferences", "subscribe", "digest"])),
    module(integrationKernelMeta, () => pending(integrationKernelMeta.id, ["status", "call", "register"])),
    module(storageKernelMeta, () => pending(storageKernelMeta.id, ["put", "signedUrl", "list", "remove", "versions"])),
    module(aiKernelMeta, () => pending(aiKernelMeta.id, ["prompts.register", "prompts.get", "complete", "embed", "retrieve", "summarize", "buildContext"])),
    module(designKernelMeta, ({ resolve }) => createMemoryDesign(resolve<ContextKernelApi>("context"))),
  ];
}
