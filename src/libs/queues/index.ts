/**
 * @pulse/queues — adapter home for background work.
 *
 * Placeholder interfaces only; the worker runtime binds a real adapter in
 * 2B.1.5. `src/workers/*` consume this port, never a vendor SDK.
 */
import type { RetryPolicy } from "@/services/event-bus";

export type QueueName =
  | "email"
  | "sms"
  | "notification"
  | "analytics"
  | "search-index"
  | "gis-processing"
  | "knowledge"
  | "ai"
  | "import"
  | "cleanup";

export type QueueHandler = (payload: Record<string, unknown>) => Promise<void>;

export interface QueueAdapter {
  readonly provider: "memory" | "cf_queues" | "redis" | "pgboss";
  enqueue(queue: QueueName, payload: Record<string, unknown>, retry?: RetryPolicy): Promise<string>;
  process(queue: QueueName, handler: QueueHandler): () => void;
  depth(queue: QueueName): Promise<number>;
}

export type QueueAdapterFactory = (config: { url?: string }) => QueueAdapter;

export const defaultRetryPolicy: RetryPolicy = {
  maxAttempts: 5,
  backoff: "exponential",
  initialDelayMs: 1_000,
};

export const queueAdapters: Partial<Record<QueueAdapter["provider"], QueueAdapterFactory>> = {};
