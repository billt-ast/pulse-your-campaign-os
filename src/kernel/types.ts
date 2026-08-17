/**
 * @pulse/kernel — core runtime types.
 * ---------------------------------------------------------------------------
 * The Pulse Kernel is the runtime operating system of the platform.
 * Applications talk ONLY to kernel interfaces; kernels talk to infrastructure
 * through adapters. Nothing bypasses the kernel.
 * ---------------------------------------------------------------------------
 */

/** Stable identifiers for every kernel module. */
export const KERNEL_IDS = [
  "security",
  "data",
  "identity",
  "context",
  "event",
  "mission",
  "workflow",
  "knowledge",
  "spatial",
  "analytics",
  "notification",
  "integration",
  "ai",
  "design",
  "storage",
] as const;
export type KernelId = (typeof KERNEL_IDS)[number];

/** Declarative descriptor every kernel module must publish. */
export interface KernelMeta {
  id: KernelId;
  name: string;
  purpose: string;
  /** Kernels this module may call synchronously. */
  dependencies: KernelId[];
  /** Domain events emitted onto the Event Kernel. */
  publishes: string[];
  /** Domain events subscribed to. */
  consumes: string[];
  /** Named extension points for future plugins. */
  extensionPoints: string[];
}

export type HealthStatus = "healthy" | "degraded" | "unavailable";

export interface KernelHealth {
  id: KernelId;
  status: HealthStatus;
  detail?: string;
  checkedAt: string;
}

export interface KernelMetrics {
  id: KernelId;
  counters: Record<string, number>;
}

/** Runtime configuration handed to every kernel at init time. */
export interface KernelConfig {
  environment: "development" | "staging" | "production";
  /** During 2B.1.1–2B.1.3 all providers are mocked / in-memory. */
  providerMode: "memory" | "live";
  featureFlags: Record<string, boolean>;
  locale: string;
  timezone: string;
}

/** Runtime context propagated with every kernel call. */
export interface RuntimeContext {
  requestId: string;
  organizationId: string | null;
  workspaceId: string | null;
  missionId: string | null;
  userId: string | null;
  permissions: string[];
  geography: { code: string; level: string } | null;
  locale: string;
  timezone: string;
  theme: "light" | "dark" | "system";
  now: string;
}

/** Lifecycle contract implemented by every kernel module. */
export interface KernelModule<TApi = unknown> {
  readonly meta: KernelMeta;
  init(runtime: KernelRuntimeHandle): Promise<TApi> | TApi;
  health(): Promise<KernelHealth> | KernelHealth;
  metrics?(): KernelMetrics;
  shutdown?(): Promise<void> | void;
}

/** Handle passed to a kernel during init — config plus already-booted peers. */
export interface KernelRuntimeHandle {
  config: KernelConfig;
  /** Resolve a peer kernel API. Throws when the peer booted after the caller. */
  resolve<T>(id: KernelId): T;
}
