/**
 * media contracts — storage upload + listing.
 */
import { z } from "zod";
import { uuid, nonEmptyString, isoTimestamp, paginated, paginationInput } from "@/packages/validators";

export const mediaAsset = z.object({
  id: uuid,
  organizationId: uuid,
  missionId: uuid.nullable(),
  path: nonEmptyString.max(1024),
  mimeType: z.string().min(1).max(120),
  bytes: z.number().int().nonnegative(),
  createdAt: isoTimestamp,
});
export type MediaAsset = z.infer<typeof mediaAsset>;

export const createUploadUrlRequest = z.object({
  organizationId: uuid,
  missionId: uuid.nullable(),
  filename: nonEmptyString.max(255),
  mimeType: z.string().min(1).max(120),
});
export const createUploadUrlResponse = z.object({
  uploadUrl: z.string().url(),
  path: z.string(),
});
export const listMediaRequest = paginationInput.extend({ organizationId: uuid });
export const listMediaResponse = paginated(mediaAsset);
