/**
 * analytics contracts — event track + query.
 */
import { z } from "zod";
import { analyticsEvent, uuid, nonEmptyString, isoTimestamp } from "@/packages/validators";

export const trackEventRequest = z.object({
  name: nonEmptyString.max(120),
  organizationId: uuid,
  missionId: uuid.nullable().optional(),
  properties: z.record(z.string(), z.unknown()).default({}),
});
export const queryEventsRequest = z.object({
  organizationId: uuid,
  from: isoTimestamp,
  to: isoTimestamp,
  names: z.array(z.string()).max(50).optional(),
});
export const queryEventsResponse = z.object({ events: z.array(analyticsEvent) });

/* Forecasts and executive summaries (2B.1.1E) ---------------------- */
import {
  executiveSummary,
  executiveSummaryRequest,
  forecast,
  forecastRequest,
  metricQuery,
  series,
} from "@/packages/validators";

export const queryMetricsRequest = metricQuery;
export const queryMetricsResponse = z.object({ data: z.array(series) });

export const createForecastRequest = forecastRequest;
export const createForecastResponse = forecast;

export const createExecutiveSummaryRequest = executiveSummaryRequest;
export const createExecutiveSummaryResponse = executiveSummary;
