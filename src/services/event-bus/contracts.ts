/**
 * event-bus contracts — Event Kernel surface.
 *
 * Publication envelopes, subscription registration, queue jobs, retry policy
 * and dead-letter inspection. Kernels never call each other directly; they
 * exchange these envelopes.
 */
import { z } from "zod";
import { domainEvent, isoTimestamp, paginated, paginationInput, uuid } from "@/packages/validators";

export const publishEventRequest = z.object({
  name: z.string().min(1).max(160),
  payload: z.record(z.string(), z.unknown()).default({}),
  organizationId: uuid.nullable(),
  missionId: uuid.nullable().optional(),
});
export const publishEventResponse = domainEvent;

export const subscriptionMode = z.enum(["sync", "queued", "cron"]);

export const subscription = z.object({
  id: uuid,
  pattern: z.string().min(1).max(160), // "mission.*", "*", "mission.created"
  handler: z.string().min(1).max(160),
  mode: subscriptionMode.default("queued"),
  enabled: z.boolean().default(true),
});
export type Subscription = z.infer<typeof subscription>;

export const retryPolicy = z.object({
  maxAttempts: z.number().int().min(1).max(20).default(5),
  backoff: z.enum(["fixed", "exponential"]).default("exponential"),
  initialDelayMs: z.number().int().min(100).max(60_000).default(1_000),
});
export type RetryPolicy = z.infer<typeof retryPolicy>;

export const queueJob = z.object({
  id: uuid,
  queue: z.string().min(1).max(80),
  payload: z.record(z.string(), z.unknown()),
  attempts: z.number().int().nonnegative().default(0),
  availableAt: isoTimestamp,
  status: z.enum(["queued", "processing", "done", "dead"]),
});
export type QueueJob = z.infer<typeof queueJob>;

export const enqueueJobRequest = z.object({
  queue: z.string().min(1).max(80),
  payload: z.record(z.string(), z.unknown()).default({}),
  retry: retryPolicy.optional(),
});

export const listDeadLettersRequest = paginationInput.extend({
  pattern: z.string().max(160).optional(),
});
export const listDeadLettersResponse = paginated(
  domainEvent.extend({ attempts: z.number().int().nonnegative(), lastError: z.string().max(4000).nullable() }),
);

export const queueDepthResponse = z.object({
  queues: z.record(z.string(), z.number().int().nonnegative()),
  checkedAt: isoTimestamp,
});
