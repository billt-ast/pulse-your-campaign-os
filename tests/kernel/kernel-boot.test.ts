/**
 * Kernel boot/shutdown smoke suite.
 *
 * Guarantees, with in-memory adapters only (no infrastructure), that:
 *  - the registry graph is acyclic and every dependency is declared,
 *  - all 15 kernels boot in dependency order,
 *  - every kernel API is resolvable and reports healthy,
 *  - undeclared cross-kernel resolution is rejected,
 *  - the event bus + queues round-trip,
 *  - shutdown drains work and releases every kernel.
 */
import { describe, expect, it } from "vitest";
import { bootKernel, defaultKernelConfig } from "@/kernel/boot";
import { KERNEL_REGISTRY, resolveBootOrder } from "@/kernel/registry";
import { KERNEL_IDS, type KernelId } from "@/kernel/types";
import { createMemoryKernelModules, createMemoryEventBus } from "@/kernel/adapters/memory";
import type { EventKernelApi } from "@/kernel/contracts/event";
import type { ContextKernelApi } from "@/kernel/contracts/context";
import type { SecurityKernelApi } from "@/kernel/contracts/security";
import type { DataKernelApi } from "@/kernel/contracts/data";
import type { DesignKernelApi } from "@/kernel/contracts/design";

describe("kernel registry", () => {
  it("declares every kernel id exactly once", () => {
    expect(Object.keys(KERNEL_REGISTRY).sort()).toEqual([...KERNEL_IDS].sort());
  });

  it("resolves an acyclic boot order covering all kernels", () => {
    const order = resolveBootOrder();
    expect(order).toHaveLength(KERNEL_IDS.length);
    expect(new Set(order).size).toBe(KERNEL_IDS.length);
  });

  it("places every dependency before its dependent", () => {
    const order = resolveBootOrder();
    for (const id of order) {
      for (const dep of KERNEL_REGISTRY[id].dependencies) {
        expect(order.indexOf(dep)).toBeLessThan(order.indexOf(id));
      }
    }
  });

  it("rejects dependency cycles", () => {
    const cyclic = {
      ...KERNEL_REGISTRY,
      design: { ...KERNEL_REGISTRY.design, dependencies: ["mission"] as KernelId[] },
      mission: { ...KERNEL_REGISTRY.mission, dependencies: ["design"] as KernelId[] },
    };
    expect(() => resolveBootOrder(cyclic)).toThrow(/cycle/i);
  });

  it("provides a module for every registered kernel", () => {
    const ids = createMemoryKernelModules().map((m) => m.meta.id);
    expect(ids.sort()).toEqual([...KERNEL_IDS].sort());
  });
});

describe("kernel boot", () => {
  it("boots all kernels in registry order with memory adapters", async () => {
    const kernel = await bootKernel();
    try {
      expect(kernel.config.providerMode).toBe("memory");
      expect(kernel.bootOrder).toEqual(resolveBootOrder());
      expect(kernel.bootOrder[0]).toBe("security");
      expect(kernel.bootOrder.at(-1)).toBe("design");
    } finally {
      await kernel.shutdown();
    }
  });

  it("exposes a resolvable api for every kernel", async () => {
    const kernel = await bootKernel();
    try {
      for (const id of KERNEL_IDS) {
        expect(kernel.get(id), `kernel ${id} api`).toBeTruthy();
      }
    } finally {
      await kernel.shutdown();
    }
  });

  it("reports every kernel healthy", async () => {
    const kernel = await bootKernel();
    try {
      const health = await kernel.health();
      expect(health).toHaveLength(KERNEL_IDS.length);
      expect(health.every((h) => h.status === "healthy")).toBe(true);
    } finally {
      await kernel.shutdown();
    }
  });

  it("honours config overrides", async () => {
    const kernel = await bootKernel({ config: { locale: "sw-KE", featureFlags: { kernelDemo: true } } });
    try {
      expect(kernel.config.locale).toBe("sw-KE");
      expect(kernel.config.featureFlags.kernelDemo).toBe(true);
      expect(kernel.get<ContextKernelApi>("context").current().locale).toBe("sw-KE");
    } finally {
      await kernel.shutdown();
    }
  });

  it("defaults to the Nairobi timezone", () => {
    expect(defaultKernelConfig().timezone).toBe("Africa/Nairobi");
  });

  it("blocks undeclared cross-kernel resolution", async () => {
    let error: unknown;
    const modules = createMemoryKernelModules().map((mod) =>
      mod.meta.id === "design"
        ? {
            ...mod,
            init: (runtime: Parameters<typeof mod.init>[0]) => {
              try {
                runtime.resolve("spatial");
              } catch (caught) {
                error = caught;
              }
              return mod.init(runtime);
            },
          }
        : mod,
    );
    const kernel = await bootKernel({ modules });
    try {
      expect((error as Error).message).toMatch(/undeclared dependency/);
    } finally {
      await kernel.shutdown();
    }
  });

  it("fails fast when a module is missing", async () => {
    const modules = createMemoryKernelModules().filter((m) => m.meta.id !== "ai");
    await expect(bootKernel({ modules })).rejects.toThrow(/no module registered for kernel ai/);
  });
});

describe("kernel contract availability", () => {
  it("round-trips security encryption and rate limits", async () => {
    const kernel = await bootKernel();
    try {
      const security = kernel.get<SecurityKernelApi>("security");
      const cipher = await security.encryption.encrypt("pulse");
      expect(await security.encryption.decrypt(cipher)).toBe("pulse");
      expect(await security.encryption.hash("pulse")).toHaveLength(64);

      const first = await security.rateLimiter.consume("test", 1, 60);
      const second = await security.rateLimiter.consume("test", 1, 60);
      expect(first.allowed).toBe(true);
      expect(second.allowed).toBe(false);
    } finally {
      await kernel.shutdown();
    }
  });

  it("persists through the data kernel repository and cache", async () => {
    const kernel = await bootKernel();
    try {
      const data = kernel.get<DataKernelApi>("data");
      const repo = data.repository<{ id: string; name: string }>("missions");
      const created = await repo.create({ id: "m1", name: "Mission One" });
      expect(created.id).toBe("m1");
      expect((await repo.list()).data).toHaveLength(1);
      await repo.remove("m1");
      expect(await repo.findById("m1")).toBeNull();

      await data.cache.set("kernel:test", 42);
      expect(await data.cache.get("kernel:test")).toBe(42);
      await data.cache.invalidate("kernel:");
      expect(await data.cache.get("kernel:test")).toBeNull();
    } finally {
      await kernel.shutdown();
    }
  });

  it("scopes context inside with() and restores it after", async () => {
    const kernel = await bootKernel();
    try {
      const context = kernel.get<ContextKernelApi>("context");
      const inner = await context.with({ missionId: "mission-1" }, async () => context.current().missionId);
      expect(inner).toBe("mission-1");
      expect(context.current().missionId).toBeNull();
    } finally {
      await kernel.shutdown();
    }
  });

  it("delivers events to subscribers and drains them on shutdown", async () => {
    const kernel = await bootKernel();
    const seen: string[] = [];
    const events = kernel.get<EventKernelApi>("event");
    const off = events.bus.subscribe("mission.*", (event) => void seen.push(event.name));
    await events.bus.publish("mission.created", { id: "m1" });
    await events.bus.publish("spatial.layer_updated", { id: "l1" });
    await kernel.shutdown();
    off();
    expect(seen).toEqual(["mission.created"]);
  });

  it("routes queue payloads to the registered worker", async () => {
    const kernel = await bootKernel();
    try {
      const events = kernel.get<EventKernelApi>("event");
      const handled: Record<string, unknown>[] = [];
      events.queues.process("email", async (payload) => void handled.push(payload));
      await events.queues.enqueue("email", { to: "ops@pulse.test" });
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(handled).toEqual([{ to: "ops@pulse.test" }]);
      expect(events.queues.depth("email")).toBe(0);
    } finally {
      await kernel.shutdown();
    }
  });

  it("captures failing handlers as dead letters instead of throwing", async () => {
    const bus = createMemoryEventBus();
    bus.subscribe("*", () => {
      throw new Error("handler boom");
    });
    await bus.publish("mission.created", { id: "m1" });
    await bus.drain();
    expect(bus.deadLetters().map((e) => e.name)).toEqual(["mission.created"]);
  });

  it("exposes design tokens and a chart palette", async () => {
    const kernel = await bootKernel();
    try {
      const design = kernel.get<DesignKernelApi>("design");
      const tokens = design.tokens();
      expect(Object.keys(tokens.color).length).toBeGreaterThan(0);
      expect(design.chartPalette().length).toBeGreaterThan(2);
      design.setTheme("dark");
      expect(design.theme()).toBe("dark");
    } finally {
      await kernel.shutdown();
    }
  });

  it("throws NotImplementedYet for deferred kernel operations", async () => {
    const kernel = await bootKernel();
    try {
      const mission = kernel.get<{ missions: { list(): Promise<unknown> } }>("mission");
      await expect(mission.missions.list()).rejects.toThrow(/not implemented in the memory adapter/);
    } finally {
      await kernel.shutdown();
    }
  });
});

describe("kernel shutdown", () => {
  it("releases every kernel api", async () => {
    const kernel = await bootKernel();
    await kernel.shutdown();
    expect(() => kernel.get("security")).toThrow(/not available/);
  });

  it("is safe to call twice", async () => {
    const kernel = await bootKernel();
    await kernel.shutdown();
    await expect(kernel.shutdown()).resolves.toBeUndefined();
  });
});
