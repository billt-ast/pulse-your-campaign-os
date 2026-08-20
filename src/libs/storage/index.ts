/**
 * @pulse/storage — adapter home for the Storage Kernel.
 *
 * Placeholder interfaces only; Supabase Storage / R2 adapters land in 2B.1.4.
 */
import type { BucketDefinition, StoredObject } from "@/services/storage";

export interface StorageAdapter {
  readonly provider: "memory" | "supabase" | "r2" | "s3";
  ensureBucket(definition: BucketDefinition): Promise<void>;
  put(input: { bucket: string; path: string; body: Blob | ArrayBuffer; mimeType: string }): Promise<StoredObject>;
  signedUrl(input: { bucket: string; path: string; expiresInSeconds: number; download?: boolean }): Promise<string>;
  list(input: { bucket: string; prefix?: string; limit?: number }): Promise<StoredObject[]>;
  remove(input: { bucket: string; path: string }): Promise<void>;
  versions(input: { bucket: string; path: string }): Promise<StoredObject[]>;
}

export type StorageAdapterFactory = (config: { url?: string }) => StorageAdapter;

/** Tenant-scoped object path: `<org>/<mission|shared>/<name>`. */
export function objectPath(organizationId: string, missionId: string | null, name: string): string {
  return `${organizationId}/${missionId ?? "shared"}/${name}`;
}

export const storageAdapters: Partial<Record<StorageAdapter["provider"], StorageAdapterFactory>> = {};
