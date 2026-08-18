/**
 * Kernel lifecycle — boot, health, shutdown.
 *
 * Boot order is derived from the registry graph; every module receives a
 * handle that can resolve only kernels it declared as dependencies.
 */
import { logger } from "@/libs/logging";
import { metric } from "@/libs/observability";
import { KERNEL_REGISTRY, resolveBootOrder } from "./registry";
import { createMemoryKernelModules } from "./adapters/memory";
import type {
  KernelConfig,
  KernelHealth,
  KernelId,
  KernelModule,
  KernelRuntimeHandle,
} from "./types";
import type { EventKernelApi } from "./contracts/event";

export interface PulseKernel {
  config: KernelConfig;
  bootOrder: KernelId[];
  get<T>(id: KernelId): T;
  health(): Promise<KernelHealth[]>;
  shutdown(): Promise<void>;
}

export function defaultKernelConfig(): KernelConfig {
  const env = (typeof process !== "undefined" ? process.env?.NODE_ENV : undefined) ?? "development";
  return {
    environment: env === "production" ? "production" : env === "staging" ? "staging" : "development",
    // Real providers are attached in phase 2B.1.4.
    providerMode: "memory",
    featureFlags: {},
    locale: "en-KE",
    timezone: "Africa/Nairobi",
  };
}

export async function bootKernel(options?: {
  config?: Partial<KernelConfig>;
  modules?: KernelModule[];
}): Promise<PulseKernel> {
  const config = { ...defaultKernelConfig(), ...(options?.config ?? {}) };
  const modules = options?.modules ?? createMemoryKernelModules();
  const byId = new Map<KernelId, KernelModule>(modules.map((m) => [m.meta.id, m]));
  const bootOrder = resolveBootOrder();
  const apis = new Map<KernelId, unknown>();
  const booted: KernelId[] = [];
  const started = Date.now();

  for (const id of bootOrder) {
    const mod = byId.get(id);
    if (!mod) throw new Error(`no module registered for kernel ${id}`);
    const allowed = new Set(KERNEL_REGISTRY[id].dependencies);
    const handle: KernelRuntimeHandle = {
      config,
      resolve<T>(dep: KernelId): T {
        if (!allowed.has(dep)) {
          throw new Error(`kernel ${id} may not resolve ${dep}: undeclared dependency`);
        }
        if (!apis.has(dep)) throw new Error(`kernel ${dep} is not booted yet`);
        return apis.get(dep) as T;
      },
    };
    apis.set(id, await mod.init(handle));
    booted.push(id);
    logger.debug("kernel initialized", { kernel: id });
  }

  metric("kernel.boot_ms", Date.now() - started, { modules: booted.length, mode: config.providerMode });
  logger.info("pulse kernel booted", { order: booted.join(","), mode: config.providerMode });

  return {
    config,
    bootOrder,
    get<T>(id: KernelId): T {
      if (!apis.has(id)) throw new Error(`kernel ${id} is not available`);
      return apis.get(id) as T;
    },
    async health() {
      return Promise.all(bootOrder.map((id) => byId.get(id)!.health()));
    },
    async shutdown() {
      const events = apis.get("event") as EventKernelApi | undefined;
      await events?.bus.drain();
      for (const id of [...booted].reverse()) {
        await byId.get(id)?.shutdown?.();
      }
      apis.clear();
      logger.info("pulse kernel shut down");
    },
  };
}

/** Process-wide singleton — kernels are stateless enough to share per isolate. */
let singleton: Promise<PulseKernel> | null = null;
export function kernel(): Promise<PulseKernel> {
  singleton ??= bootKernel();
  return singleton;
}
