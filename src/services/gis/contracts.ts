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

/* Ingest jobs, CRS and tile layers (2B.1.1E) ----------------------- */
import { coordinateSystem, ingestJobStatus, spatialFormat, spatialIngestJob, tileLayer } from "@/packages/validators";

export const startIngestJobRequest = z.object({
  organizationId: uuid,
  workspaceId: uuid.nullable(),
  layerId: uuid,
  format: spatialFormat,
  sourceUrl: z.string().url(),
  crs: coordinateSystem.default("EPSG:4326"),
});
export const ingestJobResponse = spatialIngestJob;
export const listIngestJobsRequest = z.object({
  layerId: uuid.optional(),
  status: ingestJobStatus.optional(),
});
export const listIngestJobsResponse = z.object({ data: z.array(spatialIngestJob) });

export const upsertTileLayerRequest = tileLayer.omit({ id: true });
export const listTileLayersResponse = z.object({ data: z.array(tileLayer) });
