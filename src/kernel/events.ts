/**
 * Event Kernel primitives — the platform communication bus.
 * Cross-kernel communication prefers events over direct calls.
 */
import type { RuntimeContext } from "./types";

export interface DomainEventEnvelope<T = Record<string, unknown>> {
  id: string;
  name: string;
  occurredAt: string;
  correlationId: string;
  organizationId: string | null;
  actorId: string | null;
  payload: T;
}

export type EventHandler<T = Record<string, unknown>> = (
  event: DomainEventEnvelope<T>,
) => void | Promise<void>;

export interface EventBus {
  publish<T extends Record<string, unknown>>(
    name: string,
    payload: T,
    ctx?: Partial<RuntimeContext>,
  ): Promise<DomainEventEnvelope<T>>;
  subscribe(pattern: string, handler: EventHandler): () => void;
  /** Failed deliveries, retained for inspection / replay. */
  deadLetters(): DomainEventEnvelope[];
  drain(): Promise<void>;
}
