/**
 * Live kernel adapters — Supabase, Neon, Redis, Cloud Storage and Mapbox.
 *
 * Composition rule: start from the in-memory module set, then swap in a live
 * provider for every kernel whose infrastructure is configured. A missing
 * credential degrades that one kernel to memory and reports `degraded` health —
 * the platform still boots, and no domain code changes either way.
 *
 * Server-only (`*.server.ts`): never reachable from a client bundle.
 */
import { logger } from "@/libs/logging";
import type {
  KernelConfig,
  KernelHealth,
  KernelId,
  KernelMeta,
  KernelModule,
} from "../types";
import type { DataKernelApi, DataProviderName, Repository } from "../contracts/data";
import { dataKernelMeta } from "../contracts/data";
import { eventKernelMeta, type EventKernelApi, type QueueService } from "../contracts/event";
import { storageKernelMeta, type StorageKernelApi, type StoredAsset } from "../contracts/storage";
import { spatialKernelMeta, type SpatialFeature, type SpatialKernelApi } from "../contracts/spatial";
import { createMemoryData, createMemoryEventBus, createMemoryKernelModules, createMemoryQueues } from "./memory";
import {
  createSupabaseRepository,
  createSupabaseStorage,
  supabaseAdminClient,
  supabaseConfigured,
  supabaseHealthy,
} from "./providers/supabase.server";
import { createNeonRepository, neonConfig, neonHealthy, type NeonConfig } from "./providers/neon.server";
import { createRedisCache, createRedisQueues, redisConfig, redisHealthy } from "./providers/redis.server";
import { createMapboxSpatial, mapboxConfig, mapboxHealthy } from "./providers/mapbox.server";

/** Collections that live in the transactional core (Supabase Postgres). */
export const SUPABASE_COLLECTIONS = new Set([
  "organizations",
  "workspaces",
  "missions",
  "invitations",
  "workflowInstances",
  "storageAssets",
]);

/** Collections routed to Neon when it is configured (analytical / high volume). */
export const NEON_COLLECTIONS = new Set(["analyticsEvents", "metricSnapshots", "spatialFeatures"]);

export interface LiveProviderStatus {
  supabase: boolean;
  neon: boolean;
  redis: boolean;
  storage: boolean;
  mapbox: boolean;
}

function health(id: KernelId, ok: boolean, detail: string): KernelHealth {
  return { id, status: ok ? "healthy" : "degraded", detail, checkedAt: new Date().toISOString() };
}

function liveModule<T>(
  meta: KernelMeta,
  init: (runtime: { config: KernelConfig; resolve: <R>(id: KernelId) => R }) => Promise<T> | T,
  probe: () => Promise<KernelHealth> | KernelHealth,
): KernelModule<T> {
  return { meta, init, health: probe };
}

/* ---------------------------------------------------------------- */
/* Data Kernel — Supabase + Neon + Redis                            */
/* ---------------------------------------------------------------- */

async function createLiveData(): Promise<{ api: DataKernelApi; status: Pick<LiveProviderStatus, "supabase" | "neon" | "redis"> }> {
  const fallback = createMemoryData();
  const supabase = supabaseConfigured() ? await supabaseAdminClient() : null;
  const neon: NeonConfig | null = neonConfig();
  const redis = redisConfig();
  const repos = new Map<string, Repository<unknown>>();

  const providerFor = (collection: string): DataProviderName => {
    if (neon && NEON_COLLECTIONS.has(collection)) return "neon";
    if (supabase && SUPABASE_COLLECTIONS.has(collection)) return "supabase";
    return "memory";
  };

  const api: DataKernelApi = {
    repository<T>(collection: string): Repository<T> {
      const cached = repos.get(collection);
      if (cached) return cached as Repository<T>;
      const provider = providerFor(collection);
      const repo =
        provider === "neon"
          ? createNeonRepository<T>(neon!, collection)
          : provider === "supabase"
            ? createSupabaseRepository<T>(supabase!, collection)
            : fallback.repository<T>(collection);
      repos.set(collection, repo as Repository<unknown>);
      return repo;
    },
    // Postgres transactions cannot span HTTP calls on the edge runtime; the
    // Data Kernel serialises the unit of work and relies on idempotent writes.
    unitOfWork: { transaction: async (fn) => fn() },
    cache: redis ? createRedisCache(redis) : fallback.cache,
    providerFor,
  };

  if (!supabase) logger.warn("data kernel: supabase not configured, using memory repositories");
  if (!redis) logger.warn("data kernel: redis not configured, using memory cache");

  return { api, status: { supabase: Boolean(supabase), neon: Boolean(neon), redis: Boolean(redis) } };
}

/* ---------------------------------------------------------------- */
/* Event Kernel — Redis-backed queues                               */
/* ---------------------------------------------------------------- */

function createLiveQueues(): QueueService {
  const redis = redisConfig();
  if (!redis) return createMemoryQueues();
  const ops = createRedisQueues(redis);
  const depths = new Map<string, number>();
  const workers = new Map<string, (p: Record<string, unknown>) => Promise<void>>();

  const drain = async (queue: string) => {
    const worker = workers.get(queue);
    if (!worker) return;
    for (;;) {
      const payload = await ops.pop(queue);
      if (!payload) break;
      depths.set(queue, Math.max(0, (depths.get(queue) ?? 1) - 1));
      await worker(payload).catch((error) =>
        logger.error("queue worker failed", { queue, error: (error as Error).message }),
      );
    }
  };

  return {
    async enqueue(queue, payload, opts) {
      const id = await ops.push(queue, { ...payload, ...(opts?.delaySeconds ? { _delaySeconds: opts.delaySeconds } : {}) });
      depths.set(queue, (depths.get(queue) ?? 0) + 1);
      if (!opts?.delaySeconds) void drain(queue);
      return id;
    },
    process(queue, handler) {
      workers.set(queue, handler);
      void drain(queue);
      return () => workers.delete(queue);
    },
    depth: (queue) => depths.get(queue) ?? 0,
  };
}

/* ---------------------------------------------------------------- */
/* Storage Kernel — Cloud Storage (Supabase Storage) + metadata      */
/* ---------------------------------------------------------------- */

const DEFAULT_BUCKET = "pulse-assets";

function createLiveStorage(data: DataKernelApi, client: Awaited<ReturnType<typeof supabaseAdminClient>>): StorageKernelApi {
  const blobs = createSupabaseStorage(client);
  const assets = data.repository<StoredAsset & { createdAt: string }>("storageAssets");

  return {
    async put({ bucket, path, body, contentType }) {
      await blobs.ensureBucket(bucket);
      const uploaded = await blobs.put({ bucket, path, body, contentType });
      const existing = (await assets.list({ filter: { bucket, path }, limit: 1 })).data[0];
      const asset = await assets.create({
        bucket,
        path: uploaded.path,
        contentType: uploaded.contentType,
        size: uploaded.size,
        version: (existing?.version ?? 0) + 1,
        metadata: {},
      } as never);
      return asset;
    },
    async signedUrl(assetId, ttlSeconds = 3600) {
      const asset = await assets.findById(assetId);
      if (!asset) throw new Error(`asset not found: ${assetId}`);
      return blobs.signedUrl(asset.bucket, asset.path, ttlSeconds);
    },
    async list(bucket, prefix) {
      const filter: Record<string, unknown> = { bucket };
      const rows = (await assets.list({ filter, limit: 200 })).data;
      return prefix ? rows.filter((row) => row.path.startsWith(prefix)) : rows;
    },
    async remove(assetId) {
      const asset = await assets.findById(assetId);
      if (!asset) return;
      await blobs.remove(asset.bucket, asset.path);
      await assets.remove(assetId);
    },
    async versions(assetId) {
      const asset = await assets.findById(assetId);
      if (!asset) return [];
      return (await assets.list({ filter: { bucket: asset.bucket, path: asset.path }, limit: 100 })).data;
    },
  };
}

/* ---------------------------------------------------------------- */
/* Module set                                                        */
/* ---------------------------------------------------------------- */

/** Which providers this process can actually reach. */
export function liveProviderStatus(): LiveProviderStatus {
  const supabase = supabaseConfigured();
  return {
    supabase,
    neon: Boolean(neonConfig()),
    redis: Boolean(redisConfig()),
    storage: supabase,
    mapbox: Boolean(mapboxConfig()),
  };
}

/**
 * Live module set. Kernels without a configured provider keep their in-memory
 * adapter, so this is safe to boot in every environment.
 */
export async function createLiveKernelModules(): Promise<KernelModule[]> {
  const modules = createMemoryKernelModules();
  const byId = new Map<KernelId, KernelModule>(modules.map((m) => [m.meta.id, m]));
  const { api: dataApi, status } = await createLiveData();
  const supabase = status.supabase ? await supabaseAdminClient() : null;
  const mapbox = mapboxConfig();
  const redis = redisConfig();
  const neon = neonConfig();

  byId.set(
    "data",
    liveModule(dataKernelMeta, () => dataApi, async () => {
      const ok = supabase ? await supabaseHealthy(supabase) : false;
      const neonOk = neon ? await neonHealthy(neon) : true;
      return health(
        "data",
        ok && neonOk,
        `supabase=${status.supabase ? (ok ? "ok" : "unreachable") : "memory"} neon=${neon ? (neonOk ? "ok" : "unreachable") : "off"} cache=${redis ? "redis" : "memory"}`,
      );
    }),
  );

  byId.set(
    "event",
    liveModule(
      eventKernelMeta,
      (): EventKernelApi => ({ bus: createMemoryEventBus(), queues: createLiveQueues() }),
      async () => health("event", redis ? await redisHealthy(redis) : false, redis ? "redis queues" : "memory queues"),
    ),
  );

  if (supabase) {
    byId.set(
      "storage",
      liveModule(
        storageKernelMeta,
        () => createLiveStorage(dataApi, supabase),
        async () => health("storage", await supabaseHealthy(supabase), `cloud storage bucket=${DEFAULT_BUCKET}`),
      ),
    );
  }

  if (mapbox) {
    byId.set(
      "spatial",
      liveModule(
        spatialKernelMeta,
        (): SpatialKernelApi => {
          const features = dataApi.repository<SpatialFeature>("spatialFeatures");
          return createMapboxSpatial(mapbox, async (batch) => {
            for (const feature of batch) await features.create(feature);
          });
        },
        async () => health("spatial", await mapboxHealthy(mapbox), "mapbox geocoding + tilesets"),
      ),
    );
  }

  logger.info("live kernel providers resolved", { ...liveProviderStatus() });
  return modules.map((m) => byId.get(m.meta.id)!);
}
