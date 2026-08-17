/** Analytics Kernel — the data engine dashboards consume. */
import type { KernelMeta } from "../types";

export interface MetricQuery {
  metric: string;
  from: string;
  to: string;
  groupBy?: string[];
  filter?: Record<string, unknown>;
}
export interface Series {
  metric: string;
  points: { t: string; value: number }[];
}
export interface AnalyticsKernelApi {
  track(name: string, properties?: Record<string, unknown>): Promise<void>;
  query(spec: MetricQuery): Promise<Series[]>;
  kpis(scope: { organizationId: string; missionId?: string }): Promise<Record<string, number>>;
  forecast(spec: MetricQuery & { horizonDays: number }): Promise<Series>;
  summary(scope: { organizationId: string; missionId?: string }): Promise<string>;
}
export const analyticsKernelMeta: KernelMeta = {
  id: "analytics",
  name: "Analytics Kernel",
  purpose: "Aggregation, KPIs, trends, forecasting, executive summaries and spatial analytics.",
  dependencies: ["data", "event", "context"],
  publishes: ["analytics.report_ready"],
  consumes: ["*"],
  extensionPoints: ["metric.definition", "warehouse.provider"],
};
