/**
 * @pulse/cache — adapter home for the Data Kernel cache port.
 *
 * Placeholder interfaces only; Redis / KV adapters land in 2B.1.4.
 */

export interface CacheAdapter {
  readonly provider: "memory" | "redis" | "kv";
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  invalidate(prefix: string): Promise<void>;
  increment(key: string, by?: number, ttlSeconds?: number): Promise<number>;
}

export type CacheAdapterFactory = (config: { url?: string }) => CacheAdapter;

/** Compose a stable cache key: `namespace:scope:key`. */
export function cacheKeyOf(namespace: string, scope: string, key: string): string {
  return `${namespace}:${scope}:${key}`;
}

export const cacheAdapters: Partial<Record<CacheAdapter["provider"], CacheAdapterFactory>> = {};
