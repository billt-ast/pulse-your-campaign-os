/** Integration Kernel — every external vendor lives behind this boundary. */
import type { KernelMeta } from "../types";

export type ProviderName =
  | "twilio" | "meta" | "google" | "microsoft" | "mapbox" | "resend"
  | "knbs" | "iebc" | "survey_of_kenya" | "world_bank";
export interface ConnectorStatus {
  provider: ProviderName;
  connected: boolean;
  lastCheckedAt: string;
}
export interface IntegrationKernelApi {
  status(): Promise<ConnectorStatus[]>;
  call<T>(provider: ProviderName, operation: string, input?: Record<string, unknown>): Promise<T>;
  register(provider: ProviderName, adapter: { call<T>(operation: string, input?: Record<string, unknown>): Promise<T> }): void;
}
export const integrationKernelMeta: KernelMeta = {
  id: "integration",
  name: "Integration Kernel",
  purpose: "Abstract every external provider behind stable kernel operations.",
  dependencies: ["security", "event"],
  publishes: ["integration.connected", "integration.call_failed"],
  consumes: [],
  extensionPoints: ["provider.adapter"],
};
