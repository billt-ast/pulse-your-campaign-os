/**
 * Supabase provider — Platform Data Kernel repositories, Storage Kernel blobs
 * and Identity Kernel admin operations.
 *
 * Server-only: this module reaches for the service-role client and must never
 * enter a client bundle. Kernels bind it; domain code never imports it.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "@/libs/logging";
import type { QuerySpec, Repository } from "@/kernel/contracts/data";
import type { StoredAsset } from "@/kernel/contracts/storage";
import { fromRow, tableFor, toRow, toSnake } from "./naming";

type AnyClient = SupabaseClient<any, any, any>;

export function supabaseConfigured(): boolean {
  return Boolean(process.env["SUPABASE_URL"] && process.env["SUPABASE_SERVICE_ROLE_KEY"]);
}

/** Lazily resolve the generated admin client (service role, RLS bypassed). */
export async function supabaseAdminClient(): Promise<AnyClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as AnyClient;
}

/** Repository backed by a Postgres table through the Supabase Data API. */
export function createSupabaseRepository<T>(client: AnyClient, collection: string): Repository<T> {
  const table = tableFor(collection);
  const fail = (op: string, error: { message: string }): never => {
    logger.error("supabase repository error", { table, op, error: error.message });
    throw new Error(`[data:supabase] ${table}.${op}: ${error.message}`);
  };

  return {
    async findById(id) {
      const { data, error } = await client.from(table).select("*").eq("id", id).maybeSingle();
      if (error) fail("findById", error);
      return fromRow<T>(data as Record<string, unknown> | null);
    },
    async list(spec?: QuerySpec) {
      const limit = spec?.limit ?? 50;
      const offset = spec?.cursor ? Number(spec.cursor) : 0;
      let query = client.from(table).select("*");
      for (const [key, value] of Object.entries(spec?.filter ?? {})) {
        query = value === null ? query.is(toSnake(key), null) : query.eq(toSnake(key), value);
      }
      for (const order of spec?.orderBy ?? [{ field: "createdAt", direction: "desc" as const }]) {
        query = query.order(toSnake(order.field), { ascending: order.direction === "asc" });
      }
      const { data, error } = await query.range(offset, offset + limit);
      if (error) fail("list", error);
      const rows = (data ?? []) as Record<string, unknown>[];
      const page = rows.slice(0, limit).map((row) => fromRow<T>(row)!);
      return { data: page, nextCursor: rows.length > limit ? String(offset + limit) : null };
    },
    async create(input) {
      const { data, error } = await client
        .from(table)
        .insert(toRow(input as Record<string, unknown>))
        .select("*")
        .single();
      if (error) fail("create", error);
      return fromRow<T>(data as Record<string, unknown>)!;
    },
    async update(id, input) {
      const { data, error } = await client
        .from(table)
        .update(toRow(input as Record<string, unknown>))
        .eq("id", id)
        .select("*")
        .single();
      if (error) fail("update", error);
      return fromRow<T>(data as Record<string, unknown>)!;
    },
    async remove(id) {
      const { error } = await client.from(table).delete().eq("id", id);
      if (error) fail("remove", error);
    },
  };
}

/** Cheap connectivity probe used by kernel health checks. */
export async function supabaseHealthy(client: AnyClient): Promise<boolean> {
  const { error } = await client.from("organizations").select("id").limit(1);
  return !error;
}

/* ---------------------------------------------------------------- */
/* Storage (Supabase Storage = the Cloud Storage provider)          */
/* ---------------------------------------------------------------- */

export interface SupabaseStorageOps {
  put(input: { bucket: string; path: string; body: Blob | ArrayBuffer | string; contentType?: string }): Promise<{
    path: string;
    size: number;
    contentType: string;
  }>;
  signedUrl(bucket: string, path: string, ttlSeconds: number): Promise<string>;
  list(bucket: string, prefix?: string): Promise<{ path: string; size: number }[]>;
  remove(bucket: string, path: string): Promise<void>;
  ensureBucket(bucket: string): Promise<void>;
}

export function createSupabaseStorage(client: AnyClient): SupabaseStorageOps {
  const sizeOf = (body: Blob | ArrayBuffer | string) =>
    typeof body === "string" ? new TextEncoder().encode(body).byteLength : body instanceof ArrayBuffer ? body.byteLength : body.size;

  return {
    async ensureBucket(bucket) {
      const { data } = await client.storage.getBucket(bucket);
      if (!data) await client.storage.createBucket(bucket, { public: false });
    },
    async put({ bucket, path, body, contentType }) {
      const type = contentType ?? (typeof body === "string" ? "text/plain" : "application/octet-stream");
      const { error } = await client.storage.from(bucket).upload(path, body as Blob, { contentType: type, upsert: true });
      if (error) throw new Error(`[storage:supabase] upload ${bucket}/${path}: ${error.message}`);
      return { path, size: sizeOf(body), contentType: type };
    },
    async signedUrl(bucket, path, ttlSeconds) {
      const { data, error } = await client.storage.from(bucket).createSignedUrl(path, ttlSeconds);
      if (error || !data) throw new Error(`[storage:supabase] signedUrl ${bucket}/${path}: ${error?.message}`);
      return data.signedUrl;
    },
    async list(bucket, prefix) {
      const { data, error } = await client.storage.from(bucket).list(prefix ?? "");
      if (error) throw new Error(`[storage:supabase] list ${bucket}: ${error.message}`);
      return (data ?? []).map((item) => ({
        path: prefix ? `${prefix}/${item.name}` : item.name,
        size: (item.metadata as { size?: number } | null)?.size ?? 0,
      }));
    },
    async remove(bucket, path) {
      const { error } = await client.storage.from(bucket).remove([path]);
      if (error) throw new Error(`[storage:supabase] remove ${bucket}/${path}: ${error.message}`);
    },
  };
}

export type { StoredAsset };
