/** Context Kernel — runtime awareness for every request and screen. */
import type { KernelMeta, RuntimeContext } from "../types";

export interface ContextKernelApi {
  current(): RuntimeContext;
  with<T>(patch: Partial<RuntimeContext>, fn: () => Promise<T> | T): Promise<T>;
  set(patch: Partial<RuntimeContext>): RuntimeContext;
  reset(): void;
}
export const contextKernelMeta: KernelMeta = {
  id: "context",
  name: "Context Kernel",
  purpose: "Propagate organization, workspace, mission, geography, user, locale, theme and time.",
  dependencies: ["identity"],
  publishes: ["context.changed"],
  consumes: ["identity.workspace_changed", "identity.user_signed_out"],
  extensionPoints: ["context.enricher"],
};
