/** Event Kernel — asynchronous platform bus, queues and workflow triggers. */
import type { KernelMeta } from "../types";
import type { EventBus } from "../events";

export interface QueueService {
  enqueue(queue: string, payload: Record<string, unknown>, opts?: { delaySeconds?: number; maxAttempts?: number }): Promise<string>;
  process(queue: string, handler: (payload: Record<string, unknown>) => Promise<void>): () => void;
  depth(queue: string): number;
}
export interface EventKernelApi {
  bus: EventBus;
  queues: QueueService;
}
export const eventKernelMeta: KernelMeta = {
  id: "event",
  name: "Event Kernel",
  purpose: "Domain events, routing, background queues, retries and dead-letter handling.",
  dependencies: ["security"],
  publishes: ["event.dead_lettered"],
  consumes: ["*"],
  extensionPoints: ["bus.transport", "queue.transport"],
};
