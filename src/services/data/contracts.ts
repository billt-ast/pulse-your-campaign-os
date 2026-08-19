/**
 * data contracts — Platform Data Kernel surface.
 *
 * Query specs, cursors, cache keys and health shapes. No SQL, no provider
 * names: applications describe *what* they want, adapters decide where it lives.
 */
import { z } from "zod";
import { isoTimestamp, paginationInput, uuid } from "@/packages/validators";

export const dataProvider = z.enum(["memory", "supabase", "neon", "mongo", "redis"]);
export type DataProvider = z.infer<typeof dataProvider>;

export const sortDirection = z.enum(["asc", "desc"]);

export const querySpec = paginationInput.extend({
  filter: z.record(z.string(), z.unknown()).default({}),
  orderBy: z.string().max(80).optional(),
  direction: sortDirection.default("desc"),
});
export type QuerySpecShape = z.infer<typeof querySpec>;

export const cacheKey = z.object({
  namespace: z.string().min(1).max(80),
  scope: z.string().max(120).default("global"),
  key: z.string().min(1).max(200),
  ttlSeconds: z.number().int().positive().max(86_400).default(60),
});
export type CacheKey = z.infer<typeof cacheKey>;

export const invalidateCacheRequest = z.object({ prefix: z.string().min(1).max(200) });

export const migrationRecord = z.object({
  id: uuid,
  name: z.string().min(1).max(200),
  appliedAt: isoTimestamp,
  checksum: z.string().min(8).max(128),
});

export const dataHealthResponse = z.object({
  provider: dataProvider,
  status: z.enum(["healthy", "degraded", "unavailable"]),
  latencyMs: z.number().nonnegative(),
  checkedAt: isoTimestamp,
});
export type DataHealthResponse = z.infer<typeof dataHealthResponse>;
