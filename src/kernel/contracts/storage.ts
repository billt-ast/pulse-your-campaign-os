/** Storage Kernel — unified asset management. */
import type { KernelMeta } from "../types";

export interface StoredAsset {
  id: string;
  bucket: string;
  path: string;
  contentType: string;
  size: number;
  version: number;
  metadata: Record<string, unknown>;
}
export interface StorageKernelApi {
  put(input: { bucket: string; path: string; body: Blob | ArrayBuffer | string; contentType?: string }): Promise<StoredAsset>;
  signedUrl(assetId: string, ttlSeconds?: number): Promise<string>;
  list(bucket: string, prefix?: string): Promise<StoredAsset[]>;
  remove(assetId: string): Promise<void>;
  versions(assetId: string): Promise<StoredAsset[]>;
}
export const storageKernelMeta: KernelMeta = {
  id: "storage",
  name: "Storage Kernel",
  purpose: "Documents, media, GIS datasets, 3D assets and archives with versioning and metadata.",
  dependencies: ["security", "data"],
  publishes: ["storage.asset_uploaded", "storage.asset_removed"],
  consumes: [],
  extensionPoints: ["blob.provider", "transform.pipeline"],
};
