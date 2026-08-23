/**
 * Redis provider (Upstash REST) — Data Kernel cache + Event Kernel queues.
 *
 * Uses the REST transport rather than a TCP client because the platform runs
 * on an edge worker runtime. Falls back to null when unconfigured so the
 * kernel can degrade to the in-memory adapter instead of failing to boot.
 */
import { logger } from "@/libs/logging";
import type { CacheService } from "@/kernel/contracts/data";

interface RedisConfig {
  url: string;
  token: string;
}

export function redisConfig(): RedisConfig | null {
  const url = process.env["UPSTASH_REDIS_REST_URL"] ?? process.env["REDIS_REST_URL"];
  const token = process.env["UPSTASH_REDIS_REST_TOKEN"] ?? process.env["REDIS_REST_TOKEN"];
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function command<T>(config: RedisConfig, args: (string | number)[]): Promise<T> {
  const response = await fetch(config.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(args.map(String)),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[redis] ${args[0]} failed [${response.status}]: ${body}`);
  }
  const payload = (await response.json()) as { result?: T; error?: string };
  if (payload.error) throw new Error(`[redis] ${args[0]}: ${payload.error}`);
  return payload.result as T;
}

/** Namespaced cache with SCAN-based prefix invalidation. */
export function createRedisCache(config: RedisConfig, namespace = "pulse"): CacheService {
  const key = (raw: string) => `${namespace}:${raw}`;
  return {
    async get<T>(raw: string) {
      const value = await command<string | null>(config, ["GET", key(raw)]);
      return value ? (JSON.parse(value) as T) : null;
    },
    async set<T>(raw: string, value: T, ttlSeconds?: number) {
      const args: (string | number)[] = ["SET", key(raw), JSON.stringify(value)];
      if (ttlSeconds) args.push("EX", ttlSeconds);
      await command(config, args);
    },
    async invalidate(prefix: string) {
      let cursor = "0";
      do {
        const [next, keys] = await command<[string, string[]]>(config, [
          "SCAN",
          cursor,
          "MATCH",
          `${key(prefix)}*`,
          "COUNT",
          "256",
        ]);
        cursor = next;
        if (keys.length) await command(config, ["DEL", ...keys]);
      } while (cursor !== "0");
    },
  };
}

export interface RedisQueueOps {
  push(queue: string, payload: Record<string, unknown>): Promise<string>;
  pop(queue: string): Promise<Record<string, unknown> | null>;
  depth(queue: string): Promise<number>;
}

export function createRedisQueues(config: RedisConfig, namespace = "pulse:queue"): RedisQueueOps {
  const key = (queue: string) => `${namespace}:${queue}`;
  return {
    async push(queue, payload) {
      const id = crypto.randomUUID();
      await command(config, ["RPUSH", key(queue), JSON.stringify({ id, payload })]);
      return id;
    },
    async pop(queue) {
      const raw = await command<string | null>(config, ["LPOP", key(queue)]);
      if (!raw) return null;
      return (JSON.parse(raw) as { payload: Record<string, unknown> }).payload;
    },
    async depth(queue) {
      return (await command<number>(config, ["LLEN", key(queue)])) ?? 0;
    },
  };
}

export async function redisHealthy(config: RedisConfig): Promise<boolean> {
  try {
    return (await command<string>(config, ["PING"])) === "PONG";
  } catch (error) {
    logger.warn("redis health check failed", { error: (error as Error).message });
    return false;
  }
}
