/**
 * gis contracts — geospatial features.
 */
import { z } from "zod";
import { uuid, nonEmptyString } from "@/packages/validators";

const geojson = z.object({
  type: z.string(),
  coordinates: z.unknown(),
}).passthrough();

export const createFeatureRequest = z.object({
  organizationId: uuid,
  missionId: uuid.nullable(),
  name: nonEmptyString.max(200),
  geometry: geojson,
  properties: z.record(z.string(), z.unknown()).default({}),
});
export const listFeaturesRequest = z.object({
  organizationId: uuid,
  missionId: uuid.nullable().optional(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
});
export const listFeaturesResponse = z.object({
  features: z.array(z.object({ id: uuid, name: z.string(), geometry: geojson })),
});
