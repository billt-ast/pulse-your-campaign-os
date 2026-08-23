/**
 * Mapbox provider — Spatial Kernel geocoding, boundaries, tiles and heatmaps.
 *
 * Every call goes through this adapter so no domain module ever holds a Mapbox
 * token or URL shape. Boundary tilesets are configured, not hardcoded, so a
 * different boundary source can replace Mapbox without a domain change.
 */
import { logger } from "@/libs/logging";
import type { BBox, MapLayer, SpatialFeature, SpatialKernelApi } from "@/kernel/contracts/spatial";

const GEOCODE = "https://api.mapbox.com/geocoding/v5/mapbox.places";

export interface MapboxConfig {
  token: string;
  /** Optional tileset ids per administrative level. */
  boundaryTilesets: Partial<Record<"country" | "region" | "county" | "constituency" | "ward", string>>;
  /** Default viewport used to bias searches (Kenya by default). */
  proximity: { lng: number; lat: number };
}

export function mapboxConfig(): MapboxConfig | null {
  const token = process.env["MAPBOX_ACCESS_TOKEN"] ?? process.env["MAPBOX_TOKEN"];
  if (!token) return null;
  return {
    token,
    boundaryTilesets: {
      country: process.env["MAPBOX_TILESET_COUNTRY"],
      region: process.env["MAPBOX_TILESET_REGION"],
      county: process.env["MAPBOX_TILESET_COUNTY"],
      constituency: process.env["MAPBOX_TILESET_CONSTITUENCY"],
      ward: process.env["MAPBOX_TILESET_WARD"],
    },
    proximity: { lng: 36.8219, lat: -1.2921 },
  };
}

interface FeatureCollection {
  features?: {
    id?: string;
    place_name?: string;
    text?: string;
    geometry?: { type: string; coordinates: unknown };
    properties?: Record<string, unknown>;
  }[];
}

/**
 * Spatial kernel API backed by Mapbox. `persist` lets the Spatial Kernel store
 * ingested features through the Data Kernel instead of touching a database.
 */
export function createMapboxSpatial(
  config: MapboxConfig,
  persist: (features: SpatialFeature[]) => Promise<void>,
): SpatialKernelApi {
  const call = async (url: string): Promise<FeatureCollection> => {
    const response = await fetch(url);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`[spatial:mapbox] request failed [${response.status}]: ${body}`);
    }
    return (await response.json()) as FeatureCollection;
  };

  const toFeatures = (payload: FeatureCollection, layerId: string): SpatialFeature[] =>
    (payload.features ?? []).map((feature, index) => ({
      id: String(feature.id ?? `${layerId}-${index}`),
      name: feature.place_name ?? feature.text ?? "unnamed",
      layerId,
      geometry: feature.geometry ?? { type: "Point", coordinates: [] },
      properties: feature.properties ?? {},
    }));

  return {
    async layers(): Promise<MapLayer[]> {
      const configured = Object.entries(config.boundaryTilesets).filter(([, id]) => Boolean(id));
      return [
        { id: "mapbox.satellite", name: "Satellite", kind: "satellite", visible: false },
        { id: "mapbox.streets", name: "Streets", kind: "vector", visible: true },
        ...configured.map(([level, id]) => ({
          id: id as string,
          name: `${level} boundaries`,
          kind: "vector" as const,
          visible: false,
        })),
      ];
    },
    async boundaries(level) {
      const tileset = config.boundaryTilesets[level];
      if (!tileset) {
        logger.warn("no boundary tileset configured", { level });
        return [];
      }
      const payload = await call(
        `https://api.mapbox.com/v4/${encodeURIComponent(tileset)}/features.json?access_token=${config.token}`,
      );
      return toFeatures(payload, tileset);
    },
    async search(query: string, opts?: { bbox?: BBox; limit?: number }) {
      const params = new URLSearchParams({
        access_token: config.token,
        limit: String(opts?.limit ?? 10),
        proximity: `${config.proximity.lng},${config.proximity.lat}`,
      });
      if (opts?.bbox) params.set("bbox", opts.bbox.join(","));
      const payload = await call(`${GEOCODE}/${encodeURIComponent(query)}.json?${params.toString()}`);
      return toFeatures(payload, "mapbox.geocoder");
    },
    async ingest({ format, layerId, data }) {
      if (format === "shapefile") {
        // Shapefile conversion runs in the GIS worker (2B.1.5); the kernel only
        // accepts already-normalised GeoJSON here.
        throw new Error("[spatial:mapbox] shapefile ingest is handled by the GIS worker");
      }
      const collection = data as FeatureCollection;
      const features = toFeatures(collection, layerId);
      await persist(features);
      return { features: features.length };
    },
    async heatmap({ points }) {
      // Bin to ~1km cells; the tile layer itself is rendered client-side.
      const cells = new Set(points.map((p) => `${p.lat.toFixed(2)}:${p.lng.toFixed(2)}`));
      return { cells: cells.size };
    },
  };
}

export async function mapboxHealthy(config: MapboxConfig): Promise<boolean> {
  try {
    const response = await fetch(`${GEOCODE}/nairobi.json?limit=1&access_token=${config.token}`);
    return response.ok;
  } catch (error) {
    logger.warn("mapbox health check failed", { error: (error as Error).message });
    return false;
  }
}
