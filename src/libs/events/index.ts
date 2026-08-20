/**
 * @pulse/events — adapter home for the Event Kernel transport.
 *
 * Placeholder interfaces only; durable transports (Postgres outbox, Redis
 * streams, Cloudflare Queues) land in 2B.1.5.
 */
import type { RetryPolicy } from "@/services/event-bus";

export interface EventEnvelope<T = Record<string, unknown>> {
  id: string;
  name: string;
  occurredAt: string;
  correlationId: string;
  organizationId: string | null;
  actorId: string | null;
  payload: T;
}

export type EventTransportHandler = (event: EventEnvelope) => Promise<void> | void;

/** Minimum surface every event transport adapter must implement. */
export interface EventTransportAdapter {
  readonly provider: "memory" | "postgres_outbox" | "redis_streams" | "cf_queues";
  publish(event: EventEnvelope): Promise<void>;
  subscribe(pattern: string, handler: EventTransportHandler, retry?: RetryPolicy): () => void;
  deadLetters(): Promise<EventEnvelope[]>;
  drain(): Promise<void>;
}

export type EventTransportFactory = (config: { url?: string }) => EventTransportAdapter;

/** Glob match used by every transport: `*`, `mission.*`, `mission.created`. */
export function matchesPattern(pattern: string, name: string): boolean {
  if (pattern === "*" || pattern === name) return true;
  return pattern.endsWith("*") && name.startsWith(pattern.slice(0, -1));
}

export const eventTransports: Partial<Record<EventTransportAdapter["provider"], EventTransportFactory>> = {};
