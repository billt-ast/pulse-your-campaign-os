/**
 * @pulse/observability — minimal metric / trace primitives.
 *
 * These wrap `console.*` today and expose the shape we will later back with
 * OpenTelemetry. Every helper is safe to call in the Cloudflare Worker
 * runtime (no Node-only APIs).
 */
import { logger } from "@/libs/logging";

/** Generate a request/correlation id. */
export function newRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Record a counter / gauge metric as a structured log line. */
export function metric(
  name: string,
  value: number,
  tags: Record<string, string | number | boolean> = {},
): void {
  logger.info("metric", { metric: name, value, ...tags });
}

/** Wrap an async span; emits duration + status. */
export async function trace<T>(
  name: string,
  ctx: Record<string, unknown>,
  fn: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    metric(`${name}.duration_ms`, Date.now() - start, { status: "ok" });
    return result;
  } catch (error) {
    metric(`${name}.duration_ms`, Date.now() - start, { status: "error" });
    logger.error(`${name} failed`, { ...ctx, error: (error as Error)?.message });
    throw error;
  }
}

/** Simple liveness payload for `/api/public/health`. */
export function healthPayload(): { ok: true; ts: string } {
  return { ok: true, ts: new Date().toISOString() };
}
