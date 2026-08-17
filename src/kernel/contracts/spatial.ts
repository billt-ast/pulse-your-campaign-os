/** Spatial Kernel — geospatial intelligence engine. */
import type { KernelMeta } from "../types";

export type BBox = [number, number, number, number];
export interface SpatialFeature {
  id: string;
  name: string;
  layerId: string;
  geometry: { type: string; coordinates: unknown };
  properties: Record<string, unknown>;
}
export interface MapLayer {
  id: string;
  name: string;
  kind: "vector" | "raster" | "satellite" | "heatmap";
  visible: boolean;
}
export interface SpatialKernelApi {
  layers(): Promise<MapLayer[]>;
  boundaries(level: "country" | "region" | "county" | "constituency" | "ward"): Promise<SpatialFeature[]>;
  search(query: string, opts?: { bbox?: BBox; limit?: number }): Promise<SpatialFeature[]>;
  ingest(input: { format: "geojson" | "shapefile"; layerId: string; data: unknown }): Promise<{ features: number }>;
  heatmap(input: { points: { lat: number; lng: number; weight?: number }[] }): Promise<{ cells: number }>;
}
export const spatialKernelMeta: KernelMeta = {
  id: "spatial",
  name: "Spatial Kernel",
  purpose: "Boundaries, layers, GeoJSON/shapefile ingestion, spatial search, heatmaps and routing.",
  dependencies: ["data", "context", "integration"],
  publishes: ["spatial.dataset_ingested", "spatial.layer_updated"],
  consumes: ["mission.created"],
  extensionPoints: ["tile.provider", "geocoder", "boundary.source"],
};
