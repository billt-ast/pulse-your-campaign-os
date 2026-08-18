/**
 * Kernel registry — the declared dependency graph and canonical boot order.
 *
 * The registry is the enforcement point for the dependency rules: a kernel may
 * only resolve peers it declares, and the boot order is derived from those
 * declarations (never hand-maintained).
 */
import { KERNEL_IDS, type KernelId, type KernelMeta } from "./types";
import { securityKernelMeta } from "./contracts/security";
import { dataKernelMeta } from "./contracts/data";
import { identityKernelMeta } from "./contracts/identity";
import { contextKernelMeta } from "./contracts/context";
import { eventKernelMeta } from "./contracts/event";
import { missionKernelMeta } from "./contracts/mission";
import { workflowKernelMeta } from "./contracts/workflow";
import { knowledgeKernelMeta } from "./contracts/knowledge";
import { spatialKernelMeta } from "./contracts/spatial";
import { analyticsKernelMeta } from "./contracts/analytics";
import { notificationKernelMeta } from "./contracts/notification";
import { integrationKernelMeta } from "./contracts/integration";
import { storageKernelMeta } from "./contracts/storage";
import { aiKernelMeta } from "./contracts/ai";
import { designKernelMeta } from "./contracts/design";

export const KERNEL_REGISTRY: Record<KernelId, KernelMeta> = {
  security: securityKernelMeta,
  data: dataKernelMeta,
  identity: identityKernelMeta,
  context: contextKernelMeta,
  event: eventKernelMeta,
  mission: missionKernelMeta,
  workflow: workflowKernelMeta,
  knowledge: knowledgeKernelMeta,
  spatial: spatialKernelMeta,
  analytics: analyticsKernelMeta,
  notification: notificationKernelMeta,
  integration: integrationKernelMeta,
  storage: storageKernelMeta,
  ai: aiKernelMeta,
  design: designKernelMeta,
};

/**
 * Topologically sort kernels by declared dependencies.
 * Cycles are reported rather than silently ordered — a cycle means two kernels
 * should be talking through the Event Kernel instead.
 */
export function resolveBootOrder(registry = KERNEL_REGISTRY): KernelId[] {
  const order: KernelId[] = [];
  const state = new Map<KernelId, "visiting" | "done">();

  const visit = (id: KernelId, trail: KernelId[]) => {
    const current = state.get(id);
    if (current === "done") return;
    if (current === "visiting") {
      throw new Error(`kernel dependency cycle: ${[...trail, id].join(" -> ")}`);
    }
    state.set(id, "visiting");
    for (const dep of registry[id].dependencies) {
      if (!registry[dep]) throw new Error(`kernel ${id} depends on unknown kernel ${dep}`);
      visit(dep, [...trail, id]);
    }
    state.set(id, "done");
    order.push(id);
  };

  for (const id of KERNEL_IDS) visit(id, []);
  return order;
}
