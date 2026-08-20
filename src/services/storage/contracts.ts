/**
 * storage contracts — Storage Kernel surface.
 *
 * Buckets, uploads, signed URLs, object versions and retention. `services/media`
 * and `services/documents` compose these shapes for their own asset types.
 */
import { z } from "zod";
import { isoTimestamp, nonEmptyString, paginated, paginationInput, tenantScoped, uuid } from "@/packages/validators";

export const bucketName = z.enum(["media", "documents", "geospatial", "exports", "avatars"]);
export const bucketVisibility = z.enum(["private", "signed", "public"]);

export const bucketDefinition = z.object({
  name: bucketName,
  visibility: bucketVisibility,
  maxObjectBytes: z.number().int().positive().max(5_368_709_120),
  allowedMimeTypes: z.array(z.string().max(160)).default([]),
  retentionDays: z.number().int().positive().max(3_650).nullable(),
});
export type BucketDefinition = z.infer<typeof bucketDefinition>;

export const storedObject = z
  .object({
    id: uuid,
    bucket: bucketName,
    path: nonEmptyString.max(1024),
    mimeType: z.string().max(160),
    bytes: z.number().int().nonnegative(),
    checksum: z.string().max(128).nullable(),
    version: z.number().int().positive().default(1),
    uploadedBy: uuid.nullable(),
    uploadedAt: isoTimestamp,
  })
  .merge(tenantScoped);
export type StoredObject = z.infer<typeof storedObject>;

export const createUploadRequest = z.object({
  bucket: bucketName,
  path: nonEmptyString.max(1024),
  mimeType: z.string().max(160),
  bytes: z.number().int().positive(),
});
export const createUploadResponse = z.object({
  uploadUrl: z.string().url(),
  path: nonEmptyString.max(1024),
  expiresAt: isoTimestamp,
});

export const signedUrlRequest = z.object({
  bucket: bucketName,
  path: nonEmptyString.max(1024),
  expiresInSeconds: z.number().int().min(30).max(604_800).default(3_600),
  download: z.boolean().default(false),
});
export const signedUrlResponse = z.object({ url: z.string().url(), expiresAt: isoTimestamp });

export const listObjectsRequest = paginationInput.extend({
  bucket: bucketName,
  prefix: z.string().max(1024).default(""),
});
export const listObjectsResponse = paginated(storedObject);

export const removeObjectRequest = z.object({ bucket: bucketName, path: nonEmptyString.max(1024) });

export const listObjectVersionsRequest = z.object({ bucket: bucketName, path: nonEmptyString.max(1024) });
export const listObjectVersionsResponse = z.object({ data: z.array(storedObject) });
